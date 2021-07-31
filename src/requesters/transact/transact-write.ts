import {
  DynamoDBClient,
  TransactWriteItemsCommand,
  TransactWriteItemsCommandInput,
} from "@aws-sdk/client-dynamodb";
import AsyncRetry from "async-retry";

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
import { Check } from "../_core/items-check";
import { Delete } from "../items/items-delete";
import { Put } from "../items/items-put";
import { Update } from "../items/items-update";

export class TransactWrite extends Amend {
  #ClientRequestToken?: string;

  constructor(
    databaseClient: DynamoDBClient,
    private items: (Check | Put | Delete | Update)[],
  ) {
    super(databaseClient);
  }

  /**
   * Providing a ClientRequestToken makes the call to TransactWriteItems idempotent, meaning that multiple identical
   * calls have the same effect as one single call.
   *
   * A request token of the client is valid for 10 minutes after the first request that uses it is completed. After 10
   * minutes, any request with the same client token is treated as a new request. Do not resubmit the same request with
   * the same client token for more than 10 minutes, or the result might not be idempotent.
   *
   * If you submit a request with the same client token but a change in other parameters within the 10-minute
   * idempotency window, DynamoDB returns an IdempotentParameterMismatch exception.
   * @param clientRequestToken string
   * @returns TransactWrite
   */
  clientRequestToken = (clientRequestToken: string) => {
    this.#ClientRequestToken = clientRequestToken;
    return this;
  };

  [BUILD]() {
    return {
      ...super[BUILD](),
      ...(this.#ClientRequestToken && {
        ClientRequestToken: this.#ClientRequestToken,
      }),
    };
  }

  /**
   * Execute the TransactWrite request
   */
  $ = async () => {
    const {
      ClientRequestToken,
      ReturnConsumedCapacity,
      ReturnItemCollectionMetrics,
    } = marshallRequestParameters(this[BUILD]());

    const requestInput: TransactWriteItemsCommandInput = {
      ...(ClientRequestToken && { ClientRequestToken }),
      ...(ReturnConsumedCapacity && { ReturnConsumedCapacity }),
      ...(ReturnItemCollectionMetrics && { ReturnItemCollectionMetrics }),
      TransactItems: this.items.map((item) => {
        const {
          ConditionExpression,
          ExpressionAttributeNames,
          ExpressionAttributeValues,
          Item,
          Key,
          ReturnValues,
          TableName,
          UpdateExpression,
        } = marshallRequestParameters(item[BUILD]());

        const baseRequestInput = {
          TableName,
          ...(ConditionExpression && { ConditionExpression }),
          ...(ExpressionAttributeNames && { ExpressionAttributeNames }),
          ...(ExpressionAttributeValues && { ExpressionAttributeValues }),
          ...(ReturnValues &&
            ReturnValues !== "NONE" && {
              ReturnValues: "ALL_OLD",
              ReturnValuesOnConditionCheckFailure: "ALL_OLD",
            }),
        };

        switch (item.constructor.name) {
          case "Delete":
            return { Delete: { ...baseRequestInput, Key } };
          case "Put":
            return { Put: { ...baseRequestInput, Item } };
          case "Update":
            return {
              Update: {
                Key,
                ...baseRequestInput,
                ...(UpdateExpression && { UpdateExpression }),
              },
            };
          case "Check":
            return { ConditionCheck: { Key, ...baseRequestInput } };
          default:
            return;
        }
      }),
    };

    return AsyncRetry(async (bail, attempt) => {
      const shortCircuit = createShortCircuit({
        duration: attempt * LONG_MAX_LATENCY * this.patienceRatio,
        error: new Error(TAKING_TOO_LONG_EXCEPTION),
      });
      try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { $metadata, ...transactWriteOutput } = await Promise.race([
          this.databaseClient.send(new TransactWriteItemsCommand(requestInput)),
          shortCircuit.launch(),
        ]);

        return transactWriteOutput;
      } catch (error) {
        if (isRetryableError(error)) {
          throw error;
        }
        error.$input = requestInput;
        bail(error);
      } finally {
        shortCircuit.halt();
      }
      return {};
    }, RETRY_OPTIONS);
  };
}
