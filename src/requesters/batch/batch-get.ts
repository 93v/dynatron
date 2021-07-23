import {
  BatchGetItemCommand,
  BatchGetItemCommandInput,
  BatchGetItemOutput,
  DynamoDBClient,
  GetItemCommandInput,
} from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import AsyncRetry from "async-retry";

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
import { Fetch } from "../_core/items-fetch";
import { Get } from "../items/items-get";

const BATCH_GET_LIMIT = 100;

export class BatchGet extends Fetch {
  constructor(databaseClient: DynamoDBClient, private items: Get[]) {
    super(databaseClient);
  }

  private batchGetSegment = async (requestInput: BatchGetItemCommandInput) => {
    let operationCompleted = false;
    const response: BatchGetItemOutput = {};
    return AsyncRetry(async (bail, attempt) => {
      while (!operationCompleted) {
        const shortCircuit = createShortCircuit({
          duration: attempt * LONG_MAX_LATENCY * this.patienceRatio,
          error: new Error(TAKING_TOO_LONG_EXCEPTION),
        });
        try {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { $metadata, ...output } = await Promise.race([
            this.databaseClient.send(new BatchGetItemCommand(requestInput)),
            shortCircuit.launch(),
          ]);

          if (
            output.UnprocessedKeys != undefined &&
            Object.keys(output.UnprocessedKeys).length > 0
          ) {
            requestInput.RequestItems = output.UnprocessedKeys;
          } else {
            operationCompleted = true;
          }

          if (output.Responses != undefined) {
            for (const tableName of Object.keys(output.Responses)) {
              response.Responses = response.Responses ?? {};
              response.Responses[tableName] = [
                ...(response.Responses[tableName] ?? []),
                ...output.Responses[tableName],
              ];
            }
          }

          if (output.ConsumedCapacity != undefined) {
            response.ConsumedCapacity = [
              ...(response.ConsumedCapacity ?? []),
              ...output.ConsumedCapacity,
            ];
          }
        } catch (error) {
          if (isRetryableError(error)) {
            throw error;
          }
          operationCompleted = true;
          error.$input = requestInput;
          bail(error);
        } finally {
          shortCircuit.halt();
        }
      }
      return response;
    }, RETRY_OPTIONS);
  };

  /**
   * Execute the BatchGet request
   */
  $ = async <T = Record<string, NativeValue[]> | undefined>(): Promise<
    { data: T | undefined } & Omit<BatchGetItemOutput, "Responses">
  > => {
    const {
      ReturnConsumedCapacity,
      ExpressionAttributeNames: globalExpressionAttributeNames,
      ProjectionExpression: globalProjectionExpression,
      ConsistentRead: globalConsistentRead,
    } = marshallRequestParameters(this[BUILD]());

    const requestInputs: BatchGetItemCommandInput[] = [];

    for (let index = 0; index < this.items.length; index += BATCH_GET_LIMIT) {
      const batchGroupItems = this.items.slice(index, index + BATCH_GET_LIMIT);

      const requestInput: BatchGetItemCommandInput = {
        RequestItems: {},
        ...(ReturnConsumedCapacity && { ReturnConsumedCapacity }),
      };

      const expressionAttributeNamesReverseMap: Record<string, string> = {};
      for (const item of batchGroupItems) {
        const {
          Key,
          TableName,
          ExpressionAttributeNames,
          ProjectionExpression,
          ConsistentRead,
        } = marshallRequestParameters<GetItemCommandInput>(item[BUILD]());

        if (Key == undefined || TableName == undefined) {
          continue;
        }

        requestInput.RequestItems ??= {};
        requestInput.RequestItems[TableName] ??= { Keys: [] };
        requestInput.RequestItems[TableName].Keys?.push(Key);

        if (globalConsistentRead || ConsistentRead) {
          requestInput.RequestItems[TableName].ConsistentRead =
            globalConsistentRead || ConsistentRead;
        }

        const expressionsSets: [Record<string, string>, string][] = [
          // Globals should come first for the replaceAll to happen correctly
          // Otherwise replace may happen inside a partial string
          [globalExpressionAttributeNames, globalProjectionExpression],
          [ExpressionAttributeNames, ProjectionExpression],
        ];

        for (const [exprAttributeNames, projExpr] of expressionsSets) {
          if (exprAttributeNames && projExpr) {
            let projectionExpression = projExpr;

            for (const [key, value] of Object.entries(exprAttributeNames)) {
              if (!expressionAttributeNamesReverseMap[value]) {
                expressionAttributeNamesReverseMap[value] = key;
              } else {
                projectionExpression = projectionExpression.replace(
                  new RegExp(key, "g"),
                  expressionAttributeNamesReverseMap[value],
                );
              }
            }

            requestInput.RequestItems[TableName].ProjectionExpression =
              (requestInput.RequestItems[TableName].ProjectionExpression ||
                "") +
              (requestInput.RequestItems[TableName].ProjectionExpression
                ? ", "
                : "") +
              projectionExpression;
          }
        }

        if (requestInput.RequestItems[TableName].ProjectionExpression) {
          requestInput.RequestItems[TableName].ExpressionAttributeNames ??= {};

          for (const [key, value] of Object.entries(
            expressionAttributeNamesReverseMap,
          )) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            requestInput.RequestItems[TableName].ExpressionAttributeNames![
              value
            ] = key;
          }

          requestInput.RequestItems[TableName].ProjectionExpression = [
            ...new Set(
              requestInput.RequestItems[TableName].ProjectionExpression?.split(
                ", ",
              ),
            ),
          ].join(", ");
        }
      }

      requestInputs.push(requestInput);
    }

    const outputs = await Promise.all(
      requestInputs.map((requestInput) => this.batchGetSegment(requestInput)),
    );

    const aggregatedOutput: BatchGetItemOutput = {};
    const consumedCapacityMap = {};

    for (const output of outputs) {
      aggregatedOutput.Responses = aggregatedOutput.Responses ?? {};

      if (output.Responses != undefined) {
        for (const tableName of Object.keys(output.Responses)) {
          aggregatedOutput.Responses[tableName] = [
            ...(aggregatedOutput.Responses[tableName] ?? []),
            ...output.Responses[tableName],
          ];
        }
      }

      if (output.ConsumedCapacity != undefined) {
        for (const cc of output.ConsumedCapacity) {
          if (cc?.TableName) {
            consumedCapacityMap[cc.TableName] =
              consumedCapacityMap[cc.TableName] || 0;
            consumedCapacityMap[cc.TableName] += cc.CapacityUnits;
          }
        }
      }
    }

    aggregatedOutput.ConsumedCapacity = Object.keys(consumedCapacityMap).map(
      (TableName) => ({
        TableName,
        CapacityUnits: consumedCapacityMap[TableName],
      }),
    );

    const responses: Record<string, any> = {};

    if (aggregatedOutput.Responses != undefined) {
      for (const tableName of Object.keys(aggregatedOutput.Responses)) {
        responses[tableName] = aggregatedOutput.Responses[tableName].map(
          (item) => unmarshall(item),
        );
      }
    }

    return {
      ConsumedCapacity: aggregatedOutput.ConsumedCapacity,
      UnprocessedKeys: aggregatedOutput.UnprocessedKeys,
      data: responses as T,
    };
  };
}
