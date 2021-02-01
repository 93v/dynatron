import {
  AttributeValue,
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
  validateKey,
} from "../../utils/misc-utils";
import { marshallRequestParameters } from "../../utils/request-marshaller";
import { Amend } from "./2-amend";

const BATCH_WRITE_LIMIT = 25;

export class BatchWrite extends Amend {
  constructor(
    databaseClient: DynamoDBClient,
    tableName: string,
    private keys?: NativeValue[],
    private items?: NativeValue[],
  ) {
    super(databaseClient, tableName);
    keys && keys.forEach((key) => validateKey(key));
  }

  [BUILD]() {
    return {
      ...super[BUILD](),
      ...(this.keys && { _Keys: this.keys }),
      ...(this.items && { _Items: this.items }),
    };
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
          if (output.UnprocessedItems?.[this.tableName] == undefined) {
            operationCompleted = true;
          } else {
            requestInput.RequestItems = output.UnprocessedItems;
          }

          if (output.ConsumedCapacity) {
            if (response.ConsumedCapacity) {
              if (response.ConsumedCapacity[0] != undefined) {
                response.ConsumedCapacity[0].CapacityUnits =
                  (response.ConsumedCapacity[0].CapacityUnits ?? 0) +
                  (output.ConsumedCapacity[0]?.CapacityUnits ?? 0);
              }
            } else {
              response.ConsumedCapacity = output.ConsumedCapacity;
            }
          }

          if (output.ItemCollectionMetrics) {
            if (response.ItemCollectionMetrics) {
              response.ItemCollectionMetrics[this.tableName] = [
                ...(response.ItemCollectionMetrics[this.tableName] ?? []),
                ...(output.ItemCollectionMetrics[this.tableName] ?? []),
              ];
            } else {
              response.ItemCollectionMetrics = output.ItemCollectionMetrics;
            }
          }
        } catch (error) {
          if (isRetryableError(error)) {
            throw error;
          }
          operationCompleted = true;
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
   * @param returnRawResponse boolean
   */
  $ = async <T = NativeValue[] | undefined, U extends boolean = false>(
    returnRawResponse?: U,
  ): Promise<U extends true ? BatchWriteItemOutput : T | undefined> => {
    const {
      ReturnConsumedCapacity,
      ReturnItemCollectionMetrics,
      TableName,
      ...marshalledParameters
    } = marshallRequestParameters(this[BUILD]());

    const requestInputs: BatchWriteItemCommandInput[] = [];

    if (this.keys?.length) {
      for (
        let index = 0;
        index < this.keys.length;
        index += BATCH_WRITE_LIMIT
      ) {
        const requestInput: BatchWriteItemCommandInput = {
          RequestItems: {
            [TableName]: marshalledParameters.Keys.slice(
              index,
              index + BATCH_WRITE_LIMIT,
            ).map((key: Record<string, AttributeValue>) => ({
              DeleteRequest: { Key: key },
            })),
          },
          ...(ReturnConsumedCapacity && { ReturnConsumedCapacity }),
          ...(ReturnItemCollectionMetrics && { ReturnItemCollectionMetrics }),
        };
        requestInputs.push(requestInput);
      }
    }

    if (this.items?.length) {
      for (
        let index = 0;
        index < this.items.length;
        index += BATCH_WRITE_LIMIT
      ) {
        const requestInput: BatchWriteItemCommandInput = {
          RequestItems: {
            [TableName]: marshalledParameters.Items.slice(
              index,
              index + BATCH_WRITE_LIMIT,
            ).map((item: Record<string, AttributeValue>) => ({
              PutRequest: { Item: item },
            })),
          },
          ...(ReturnConsumedCapacity && { ReturnConsumedCapacity }),
          ...(ReturnItemCollectionMetrics && { ReturnItemCollectionMetrics }),
        };
        requestInputs.push(requestInput);
      }
    }

    const outputs = await Promise.all(
      requestInputs.map((requestInput) => this.batchWriteSegment(requestInput)),
    );

    const aggregatedOutput: BatchWriteItemOutput = {};

    for (const output of outputs) {
      if (output.ConsumedCapacity) {
        if (aggregatedOutput.ConsumedCapacity) {
          if (aggregatedOutput.ConsumedCapacity[0] != undefined) {
            aggregatedOutput.ConsumedCapacity[0].CapacityUnits =
              (aggregatedOutput.ConsumedCapacity[0].CapacityUnits ?? 0) +
              (output.ConsumedCapacity[0]?.CapacityUnits ?? 0);
          }
        } else {
          aggregatedOutput.ConsumedCapacity = output.ConsumedCapacity;
        }
      }

      if (output.ItemCollectionMetrics) {
        if (aggregatedOutput.ItemCollectionMetrics) {
          aggregatedOutput.ItemCollectionMetrics[this.tableName] = [
            ...(aggregatedOutput.ItemCollectionMetrics[this.tableName] ?? []),
            ...(output.ItemCollectionMetrics[this.tableName] ?? []),
          ];
        } else {
          aggregatedOutput.ItemCollectionMetrics = output.ItemCollectionMetrics;
        }
      }
    }

    const nativeResponse =
      this.keys != undefined
        ? undefined
        : marshalledParameters.Items.map(
            (item: Record<string, AttributeValue>) => unmarshall(item),
          );

    return returnRawResponse ? aggregatedOutput : nativeResponse;
  };
}
