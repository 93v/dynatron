import {
  BatchWriteItemCommand,
  BatchWriteItemCommandInput,
  BatchWriteItemOutput,
  DynamoDBClient,
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
import { Amend } from "../_core/items-amend";
import { Delete } from "../items/items-delete";
import { Put } from "../items/items-put";

const BATCH_WRITE_LIMIT = 25;

export class BatchWrite extends Amend {
  constructor(databaseClient: DynamoDBClient, private items: (Put | Delete)[]) {
    super(databaseClient);
  }

  private batchWriteSegment = async (
    requestInput: BatchWriteItemCommandInput,
  ) => {
    let operationCompleted = false;
    const response: BatchWriteItemOutput = {};
    return AsyncRetry(async (bail, attempt) => {
      while (!operationCompleted) {
        const shortCircuit = createShortCircuit({
          duration: attempt * LONG_MAX_LATENCY * this.patienceRatio,
          error: new Error(TAKING_TOO_LONG_EXCEPTION),
        });
        try {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { $metadata, ...output } = await Promise.race([
            this.databaseClient.send(new BatchWriteItemCommand(requestInput)),
            shortCircuit.launch(),
          ]);

          if (
            output.UnprocessedItems != undefined &&
            Object.keys(output.UnprocessedItems).length > 0
          ) {
            requestInput.RequestItems = output.UnprocessedItems;
          } else {
            operationCompleted = true;
          }

          if (output.ItemCollectionMetrics != undefined) {
            for (const tableName of Object.keys(output.ItemCollectionMetrics)) {
              response.ItemCollectionMetrics =
                response.ItemCollectionMetrics ?? {};
              response.ItemCollectionMetrics[tableName] = [
                ...(response.ItemCollectionMetrics[tableName] ?? []),
                ...output.ItemCollectionMetrics[tableName],
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
   * Execute the BatchWrite request
   */

  $ = async <T = NativeValue[] | undefined>(): Promise<
    ({ data: T | undefined } & BatchWriteItemOutput) | undefined
  > => {
    const { ReturnConsumedCapacity, ReturnItemCollectionMetrics } =
      marshallRequestParameters(this[BUILD]());

    const requestInputs: BatchWriteItemCommandInput[] = [];

    for (let index = 0; index < this.items.length; index += BATCH_WRITE_LIMIT) {
      const batchGroupItems = this.items.slice(
        index,
        index + BATCH_WRITE_LIMIT,
      );

      const requestInput: BatchWriteItemCommandInput = {
        RequestItems: {},
        ...(ReturnConsumedCapacity && { ReturnConsumedCapacity }),
        ...(ReturnItemCollectionMetrics && { ReturnItemCollectionMetrics }),
      };

      for (const item of batchGroupItems) {
        const { Item, Key, TableName } = marshallRequestParameters(
          item[BUILD](),
        );

        requestInput.RequestItems ??= {};
        requestInput.RequestItems[TableName] ??= [];

        switch (item.constructor.name) {
          case "Delete":
            requestInput.RequestItems[TableName]?.push({
              DeleteRequest: { Key },
            });
            break;
          case "Put":
            requestInput.RequestItems[TableName]?.push({
              PutRequest: { Item },
            });
            break;
        }
      }

      requestInputs.push(requestInput);
    }

    const outputs = await Promise.all(
      requestInputs.map((requestInput) => this.batchWriteSegment(requestInput)),
    );

    const aggregatedOutput: BatchWriteItemOutput = {};
    const consumedCapacityMap = {};

    for (const output of outputs) {
      if (output.ConsumedCapacity != undefined) {
        for (const cc of output.ConsumedCapacity) {
          if (cc.TableName) {
            consumedCapacityMap[cc.TableName] =
              consumedCapacityMap[cc.TableName] || 0;
            consumedCapacityMap[cc.TableName] += cc.CapacityUnits;
          }
        }
      }

      if (output.ItemCollectionMetrics != undefined) {
        for (const tableName of Object.keys(output.ItemCollectionMetrics)) {
          aggregatedOutput.ItemCollectionMetrics =
            aggregatedOutput.ItemCollectionMetrics ?? {};
          aggregatedOutput.ItemCollectionMetrics[tableName] = [
            ...(aggregatedOutput.ItemCollectionMetrics[tableName] ?? []),
            ...output.ItemCollectionMetrics[tableName],
          ];
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

    for (const requestInput of requestInputs) {
      for (const tableName of Object.keys(requestInput.RequestItems || {})) {
        responses[tableName] ??= [];
        for (const item of (requestInput.RequestItems || {})[tableName]) {
          if (item.PutRequest?.Item) {
            responses[tableName].push(unmarshall(item.PutRequest.Item));
          }
        }
      }
    }

    return {
      ConsumedCapacity: aggregatedOutput.ConsumedCapacity,
      UnprocessedItems: aggregatedOutput.UnprocessedItems,
      ItemCollectionMetrics: aggregatedOutput.ItemCollectionMetrics,
      data: responses as T,
    };
  };
}
