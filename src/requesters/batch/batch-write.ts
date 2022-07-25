import AsyncRetry from "async-retry";

import {
  BatchWriteItemCommand,
  BatchWriteItemCommandInput,
  BatchWriteItemInput,
  BatchWriteItemOutput,
} from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

import { Amend } from "../_core/items-amend";
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
import { Delete } from "../items/items-delete";
import { Put } from "../items/items-put";

const BATCH_WRITE_LIMIT = 25;

export class BatchWrite extends Amend {
  constructor(databaseClient: DynatronClient, private items: (Put | Delete)[]) {
    super(databaseClient);
  }

  private batchWriteSegment = async (
    requestInput: BatchWriteItemCommandInput,
  ) => {
    let operationCompleted = false;
    const batchWriteItemOutput: BatchWriteItemOutput = {};
    return AsyncRetry(async (bail, attempt) => {
      while (!operationCompleted) {
        const shortCircuit = createShortCircuit({
          duration: attempt * LONG_MAX_LATENCY * this.patienceRatio,
          error: new Error(TAKING_TOO_LONG_EXCEPTION),
        });
        try {
          const { ConsumedCapacity, ItemCollectionMetrics, UnprocessedItems } =
            await Promise.race([
              this.databaseClient.send(new BatchWriteItemCommand(requestInput)),
              shortCircuit.launch(),
            ]);

          if (
            UnprocessedItems != undefined &&
            Object.keys(UnprocessedItems).length > 0
          ) {
            requestInput.RequestItems = UnprocessedItems;
          } else {
            operationCompleted = true;
          }

          if (ItemCollectionMetrics != undefined) {
            for (const tableName of Object.keys(ItemCollectionMetrics)) {
              batchWriteItemOutput.ItemCollectionMetrics =
                batchWriteItemOutput.ItemCollectionMetrics ?? {};
              batchWriteItemOutput.ItemCollectionMetrics[tableName] = [
                ...(batchWriteItemOutput.ItemCollectionMetrics[tableName] ??
                  []),
                ...ItemCollectionMetrics[tableName],
              ];
            }
          }

          if (ConsumedCapacity != undefined) {
            batchWriteItemOutput.ConsumedCapacity = [
              ...(batchWriteItemOutput.ConsumedCapacity ?? []),
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
      return batchWriteItemOutput;
    }, RETRY_OPTIONS);
  };

  /**
   * Execute the BatchWrite request
   */
  $ = async <T = NativeValue[] | undefined>(): Promise<
    { data: T | undefined } & BatchWriteItemOutput
  > => {
    const { ReturnConsumedCapacity, ReturnItemCollectionMetrics } =
      marshallRequestParameters<BatchWriteItemInput>(this[BUILD]());

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

        if (item instanceof Delete) {
          requestInput.RequestItems[TableName]?.push({
            DeleteRequest: { Key },
          });
        } else if (item instanceof Put) {
          requestInput.RequestItems[TableName]?.push({
            PutRequest: { Item },
          });
        }
      }

      requestInputs.push(requestInput);
    }

    const outputs = await Promise.all(
      requestInputs.map((requestInput) => this.batchWriteSegment(requestInput)),
    );

    const aggregatedOutput: BatchWriteItemOutput = {};
    const consumedCapacityMap = {};

    for (const { ConsumedCapacity, ItemCollectionMetrics } of outputs) {
      if (ConsumedCapacity != undefined) {
        for (const cc of ConsumedCapacity) {
          if (cc.TableName) {
            consumedCapacityMap[cc.TableName] =
              consumedCapacityMap[cc.TableName] || 0;
            consumedCapacityMap[cc.TableName] += cc.CapacityUnits;
          }
        }
      }

      if (ItemCollectionMetrics != undefined) {
        for (const tableName of Object.keys(ItemCollectionMetrics)) {
          aggregatedOutput.ItemCollectionMetrics =
            aggregatedOutput.ItemCollectionMetrics ?? {};
          aggregatedOutput.ItemCollectionMetrics[tableName] = [
            ...(aggregatedOutput.ItemCollectionMetrics[tableName] ?? []),
            ...ItemCollectionMetrics[tableName],
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
