import {
  DynamoDBClient,
  GetItemCommandInput,
  TransactGetItemsCommand,
  TransactGetItemsCommandInput,
  TransactGetItemsOutput,
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
import { ItemRequest } from "../_core/items-request";
import { Get } from "../items/items-get";

export class TransactGet extends ItemRequest {
  constructor(databaseClient: DynamoDBClient, private items: Get[]) {
    super(databaseClient);
  }

  /**
   * Execute the TransactGet request
   */
  $ = async <T = NativeValue[] | undefined>(): Promise<
    { data: T | undefined } & Omit<TransactGetItemsOutput, "Responses">
  > => {
    const { ReturnConsumedCapacity } = marshallRequestParameters(this[BUILD]());

    const requestInput: TransactGetItemsCommandInput = {
      ...(ReturnConsumedCapacity && { ReturnConsumedCapacity }),
      TransactItems: this.items.map((item) => {
        const {
          Key,
          TableName,
          ExpressionAttributeNames,
          ProjectionExpression,
        } = marshallRequestParameters<GetItemCommandInput>(item[BUILD]());

        return {
          Get: {
            Key,
            TableName,
            ...(ExpressionAttributeNames && { ExpressionAttributeNames }),
            ...(ProjectionExpression && { ProjectionExpression }),
          },
        };
      }),
    };

    return AsyncRetry(async (bail, attempt) => {
      const shortCircuit = createShortCircuit({
        duration: attempt * LONG_MAX_LATENCY * this.patienceRatio,
        error: new Error(TAKING_TOO_LONG_EXCEPTION),
      });
      try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { $metadata, Responses, ...transactGetOutput } =
          await Promise.race([
            this.databaseClient.send(new TransactGetItemsCommand(requestInput)),
            shortCircuit.launch(),
          ]);

        return {
          ...transactGetOutput,
          data: Responses?.map(
            (response) => response.Item && unmarshall(response.Item),
          ) as unknown as T,
        };
      } catch (error: unknown) {
        if (isRetryableError(error)) {
          throw error;
        }
        (error as any).$input = requestInput;
        bail(error as Error);
      } finally {
        shortCircuit.halt();
      }
      return { data: undefined };
    }, RETRY_OPTIONS);
  };
}
