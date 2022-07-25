import AsyncRetry from "async-retry";

import {
  BatchGetItemCommand,
  BatchGetItemCommandInput,
  BatchGetItemOutput,
  GetItemCommandInput,
} from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

import { Fetch } from "../_core/items-fetch";
import { DynatronClient, NativeValue } from "../../dynatron";
import {
  BUILD,
  createShortCircuit,
  isRetryableError,
  LONG_MAX_LATENCY,
  RETRY_OPTIONS,
  TAKING_TOO_LONG_EXCEPTION,
} from "../../utils/misc-utils";
import { marshallRequestParameters } from "../../utils/request-marshaller";
import { Get } from "../items/items-get";

const BATCH_GET_LIMIT = 100;

export class BatchGet extends Fetch {
  constructor(databaseClient: DynatronClient, private items: Get[]) {
    super(databaseClient);
  }

  private batchGetSegment = async (requestInput: BatchGetItemCommandInput) => {
    let operationCompleted = false;
    const batchGetItemOutput: BatchGetItemOutput = {};
    return AsyncRetry(async (bail, attempt) => {
      while (!operationCompleted) {
        const shortCircuit = createShortCircuit({
          duration: attempt * LONG_MAX_LATENCY * this.patienceRatio,
          error: new Error(TAKING_TOO_LONG_EXCEPTION),
        });
        try {
          const { ConsumedCapacity, Responses, UnprocessedKeys } =
            await Promise.race([
              this.databaseClient.send(new BatchGetItemCommand(requestInput)),
              shortCircuit.launch(),
            ]);

          if (
            UnprocessedKeys != undefined &&
            Object.keys(UnprocessedKeys).length > 0
          ) {
            requestInput.RequestItems = UnprocessedKeys;
          } else {
            operationCompleted = true;
          }

          if (Responses != undefined) {
            for (const tableName of Object.keys(Responses)) {
              batchGetItemOutput.Responses = batchGetItemOutput.Responses ?? {};
              batchGetItemOutput.Responses[tableName] = [
                ...(batchGetItemOutput.Responses[tableName] ?? []),
                ...Responses[tableName],
              ];
            }
          }

          if (ConsumedCapacity != undefined) {
            batchGetItemOutput.ConsumedCapacity = [
              ...(batchGetItemOutput.ConsumedCapacity ?? []),
              ...ConsumedCapacity,
            ];
          }
        } catch (error: unknown) {
          if (isRetryableError(error)) {
            throw error;
          }
          operationCompleted = true;
          (error as any).$input = requestInput;
          bail(error as Error);
        } finally {
          shortCircuit.halt();
        }
      }
      return batchGetItemOutput;
    }, RETRY_OPTIONS);
  };

  /**
   * Execute the BatchGet request
   */
  $ = async <T extends  Record<string, unknown[]> | undefined>(): Promise<
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

    const unmarshalledResponses: Record<string, NativeValue[]> = {};

    if (aggregatedOutput.Responses != undefined) {
      for (const tableName of Object.keys(aggregatedOutput.Responses)) {
        unmarshalledResponses[tableName] = aggregatedOutput.Responses[
          tableName
        ].map((item) => unmarshall(item));
      }
    }

    return {
      ConsumedCapacity: aggregatedOutput.ConsumedCapacity,
      UnprocessedKeys: aggregatedOutput.UnprocessedKeys,

      data: unmarshalledResponses as unknown as T,
    };
  };
}
