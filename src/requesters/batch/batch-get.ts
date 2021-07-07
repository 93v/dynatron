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

          if (output.UnprocessedKeys == undefined) {
            operationCompleted = true;
          } else {
            requestInput.RequestItems = output.UnprocessedKeys;
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
   * @param returnRawResponse boolean
   */
  $ = async <
    T = Record<string, NativeValue[]> | undefined,
    U extends boolean = false,
  >(
    returnRawResponse?: U,
  ): Promise<U extends true ? BatchGetItemOutput : T | undefined> => {
    //TODO: handle global projections
    const { ReturnConsumedCapacity } = marshallRequestParameters(this[BUILD]());

    const requestInputs: BatchGetItemCommandInput[] = [];

    for (let index = 0; index < this.items.length; index += BATCH_GET_LIMIT) {
      const batchGroupItems = this.items.slice(index, index + BATCH_GET_LIMIT);

      const requestInput: BatchGetItemCommandInput = {
        ...(ReturnConsumedCapacity && { ReturnConsumedCapacity }),
      };

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

        requestInput.RequestItems ||= {};
        requestInput.RequestItems[TableName] ||= { Keys: [] };
        requestInput.RequestItems[TableName].Keys?.push(Key);

        if (ConsistentRead) {
          requestInput.RequestItems[TableName].ConsistentRead = ConsistentRead;
        }

        if (ExpressionAttributeNames && ProjectionExpression) {
          requestInput.RequestItems[TableName].ProjectionExpression +=
            (requestInput.RequestItems[TableName].ProjectionExpression
              ? ", "
              : "") + ProjectionExpression;

          requestInput.RequestItems[TableName].ExpressionAttributeNames = {
            ...requestInput.RequestItems[TableName].ExpressionAttributeNames,
            ...ExpressionAttributeNames,
          };
        }
      }

      requestInputs.push(requestInput);
    }

    const outputs = await Promise.all(
      requestInputs.map((requestInput) => this.batchGetSegment(requestInput)),
    );

    const aggregatedOutput: BatchGetItemOutput = {};

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
        aggregatedOutput.ConsumedCapacity = [
          ...(aggregatedOutput.ConsumedCapacity ?? []),
          ...output.ConsumedCapacity,
        ];
      }
    }

    if (returnRawResponse) {
      return aggregatedOutput as any;
    }

    const responses: Record<string, any> = {};

    if (aggregatedOutput.Responses != undefined) {
      for (const tableName of Object.keys(aggregatedOutput.Responses)) {
        responses[tableName] = aggregatedOutput.Responses[tableName].map(
          (item) => unmarshall(item),
        );
      }
    }

    return responses as T;
  };
}
