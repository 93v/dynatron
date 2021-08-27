import {
  DynamoDBClient,
  QueryCommand,
  QueryCommandInput,
  QueryOutput,
} from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import AsyncRetry from "async-retry";

import { EqualsCondition, KeyCondition } from "../../../types/conditions";
import { and } from "../../condition-expression-builders";
import { NativeValue } from "../../dynatron";
import {
  BUILD,
  createShortCircuit,
  isRetryableError,
  LONG_MAX_LATENCY,
  RETRY_OPTIONS,
  TAKING_TOO_LONG_EXCEPTION,
} from "../../utils/misc-utils";
import { marshallRequestParameters } from "../../utils/request-marshaller";
import { ListFetch } from "../_core/items-list-fetch";

export class Query extends ListFetch {
  #ScanIndexForward?: boolean;

  private sortKeyCondition?: KeyCondition;

  constructor(
    databaseClient: DynamoDBClient,
    tableName: string,
    private partitionKeyCondition: EqualsCondition,
  ) {
    super(databaseClient, tableName);
  }

  /**
   * The condition that specifies the key values for items to be retrieved by the Query action.
   * @param keyCondition KeyCondition
   */
  having = (keyCondition: KeyCondition | undefined) => {
    if (keyCondition != undefined) {
      this.sortKeyCondition = keyCondition;
    }
    return this;
  };

  /**
   * Specifies the order for index traversal: either in ascending or descending order.
   *
   * Items with the same partition key value are stored in sorted order by sort key. If the sort key data type is Number, the results are stored in numeric order. For type String, the results are stored in order of UTF-8 bytes. For type Binary, DynamoDB treats each byte of the binary data as unsigned.
   * @param sort "ASC" | "DSC"
   */
  sort = (sort: "ASC" | "DSC") => {
    if (sort === "DSC") {
      this.#ScanIndexForward = false;
    }
    return this;
  };

  [BUILD]() {
    return {
      ...super[BUILD](),
      _KeyConditionExpression:
        this.sortKeyCondition == undefined
          ? and(this.partitionKeyCondition)
          : and(this.partitionKeyCondition, this.sortKeyCondition),
      ...(this.#ScanIndexForward != undefined && {
        ScanIndexForward: this.#ScanIndexForward,
      }),
    };
  }

  /**
   * Execute the Query request
   * @param disableRecursion boolean
   */
  $ = async <T = NativeValue[] | undefined>(
    disableRecursion = false,
  ): Promise<{ data: T | undefined } & Omit<QueryOutput, "Items">> => {
    const requestInput = marshallRequestParameters<QueryCommandInput>(
      this[BUILD](),
    );

    if (requestInput.IndexName) {
      delete requestInput.ConsistentRead;
    }

    // When both the Limit and FilterExpressions are provided we calculate
    // how complex is the FilterExpression
    // Initial complexity is 0 which sets the limit to the provided value
    let filterExpressionComplexity = 0;
    if (requestInput.Limit && requestInput.FilterExpression) {
      filterExpressionComplexity =
        (requestInput.FilterExpression.match(/AND|OR/g) || []).length + 1;
    }
    // Then the complexity is used with the following base number to request
    // for more elements when the filter is more complex for a faster resolution
    const FILTER_EXPRESSION_LIMIT_POWER_BASE = 5;

    let operationCompleted = false;
    const aggregatedQueryOutput: QueryOutput = {};

    let keyAttributes: string[] = [];

    return AsyncRetry(async (bail, attempt) => {
      while (!operationCompleted) {
        const shortCircuit = createShortCircuit({
          duration: attempt * LONG_MAX_LATENCY * this.patienceRatio,
          error: new Error(TAKING_TOO_LONG_EXCEPTION),
        });
        const input = {
          ...requestInput,
          ...(requestInput.Limit && {
            Limit:
              requestInput.Limit *
              FILTER_EXPRESSION_LIMIT_POWER_BASE ** filterExpressionComplexity,
          }),
        };
        try {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { $metadata, ...queryOutput } = await Promise.race([
            this.databaseClient.send(new QueryCommand(input)),
            shortCircuit.launch(),
          ]);

          if (queryOutput.LastEvaluatedKey == undefined || disableRecursion) {
            operationCompleted = true;
          } else {
            requestInput.ExclusiveStartKey = queryOutput.LastEvaluatedKey;
            keyAttributes = Object.keys(queryOutput.LastEvaluatedKey);
          }
          if (queryOutput.Items) {
            aggregatedQueryOutput.Items = [
              ...(aggregatedQueryOutput.Items ?? []),
              ...queryOutput.Items,
            ];
          }
          if (queryOutput.Count) {
            aggregatedQueryOutput.Count =
              (aggregatedQueryOutput.Count ?? 0) + queryOutput.Count;
          }
          if (queryOutput.ScannedCount) {
            aggregatedQueryOutput.ScannedCount =
              (aggregatedQueryOutput.ScannedCount ?? 0) +
              queryOutput.ScannedCount;
          }
          if (queryOutput.ConsumedCapacity) {
            if (aggregatedQueryOutput.ConsumedCapacity) {
              aggregatedQueryOutput.ConsumedCapacity.CapacityUnits =
                (aggregatedQueryOutput.ConsumedCapacity.CapacityUnits ?? 0) +
                (queryOutput.ConsumedCapacity.CapacityUnits ?? 0);

              aggregatedQueryOutput.ConsumedCapacity.Table =
                aggregatedQueryOutput.ConsumedCapacity.Table || {
                  CapacityUnits: 0,
                };
              aggregatedQueryOutput.ConsumedCapacity.Table.CapacityUnits =
                (aggregatedQueryOutput.ConsumedCapacity.Table?.CapacityUnits ??
                  0) + (queryOutput.ConsumedCapacity.Table?.CapacityUnits ?? 0);

              if (requestInput.IndexName != undefined) {
                aggregatedQueryOutput.ConsumedCapacity.GlobalSecondaryIndexes =
                  aggregatedQueryOutput.ConsumedCapacity
                    .GlobalSecondaryIndexes || {
                    [requestInput.IndexName]: { CapacityUnits: 0 },
                  };
                aggregatedQueryOutput.ConsumedCapacity.GlobalSecondaryIndexes[
                  requestInput.IndexName
                ].CapacityUnits =
                  (aggregatedQueryOutput.ConsumedCapacity
                    .GlobalSecondaryIndexes[requestInput.IndexName]
                    .CapacityUnits ?? 0) +
                  (queryOutput.ConsumedCapacity.GlobalSecondaryIndexes?.[
                    requestInput.IndexName
                  ].CapacityUnits ?? 0);
              }

              if (requestInput.IndexName != undefined) {
                aggregatedQueryOutput.ConsumedCapacity.LocalSecondaryIndexes =
                  aggregatedQueryOutput.ConsumedCapacity
                    .LocalSecondaryIndexes || {
                    [requestInput.IndexName]: { CapacityUnits: 0 },
                  };
                aggregatedQueryOutput.ConsumedCapacity.LocalSecondaryIndexes[
                  requestInput.IndexName
                ].CapacityUnits =
                  (aggregatedQueryOutput.ConsumedCapacity.LocalSecondaryIndexes[
                    requestInput.IndexName
                  ].CapacityUnits ?? 0) +
                  (queryOutput.ConsumedCapacity.LocalSecondaryIndexes?.[
                    requestInput.IndexName
                  ].CapacityUnits ?? 0);
              }
            } else {
              aggregatedQueryOutput.ConsumedCapacity =
                queryOutput.ConsumedCapacity;
            }
          }
          if (
            requestInput.Limit &&
            aggregatedQueryOutput.Items != undefined &&
            aggregatedQueryOutput.Items.length >= requestInput.Limit
          ) {
            aggregatedQueryOutput.Items = aggregatedQueryOutput.Items.slice(
              0,
              requestInput.Limit,
            );
            aggregatedQueryOutput.Count = aggregatedQueryOutput.Items.length;
            const lastEvaluatedKey = {
              ...aggregatedQueryOutput.Items[
                aggregatedQueryOutput.Items.length - 1
              ],
            };
            for (const key of Object.keys(lastEvaluatedKey)) {
              if (!keyAttributes.includes(key)) {
                delete lastEvaluatedKey[key];
              }
            }
            aggregatedQueryOutput.LastEvaluatedKey = lastEvaluatedKey;
            operationCompleted = true;
          }
          if (disableRecursion && queryOutput.LastEvaluatedKey != undefined) {
            aggregatedQueryOutput.LastEvaluatedKey =
              queryOutput.LastEvaluatedKey;
          }
        } catch (error: unknown) {
          if (isRetryableError(error)) {
            throw error;
          }
          operationCompleted = true;
          (error as any).$input = input;
          bail(error as Error);
        } finally {
          shortCircuit.halt();
        }
      }

      const { Items, ...output } = aggregatedQueryOutput;

      return {
        ...output,
        data: Items?.map((item) => unmarshall(item)) as unknown as T,
      };
    }, RETRY_OPTIONS);
  };
}
