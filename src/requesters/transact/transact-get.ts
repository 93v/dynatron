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
import { Request } from "../_core/items-request";
import { Get } from "../items/items-get";

export class TransactGet extends Request {
  constructor(databaseClient: DynamoDBClient, private items: Get[]) {
    super(databaseClient);
  }

  /**
   * Execute the TransactGet request
   * @param returnRawResponse boolean
   */
  $ = async <T = NativeValue[] | undefined, U extends boolean = false>(
    returnRawResponse?: U,
  ): Promise<U extends true ? TransactGetItemsOutput : T | undefined> => {
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
        const { $metadata, ...output } = await Promise.race([
          this.databaseClient.send(new TransactGetItemsCommand(requestInput)),
          shortCircuit.launch(),
        ]);

        return (
          returnRawResponse
            ? output
            : output.Responses?.map(
                (response) => response.Item && unmarshall(response.Item),
              )
        ) as any;
      } catch (error) {
        if (isRetryableError(error)) {
          throw error;
        }
        error.$input = requestInput;
        bail(error);
      } finally {
        shortCircuit.halt();
      }
    }, RETRY_OPTIONS);
  };
}
