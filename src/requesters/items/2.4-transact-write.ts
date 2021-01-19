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
import { Amend } from "./2-amend";
import { Check } from "./2.1-check";
import { Delete } from "./2.1.1-delete";
import { Put } from "./2.1.2-put";
import { Update } from "./2.1.3-update";

export class TransactWrite extends Amend {
  #ClientRequestToken?: string;

  constructor(
    databaseClient: DynamoDBClient,
    tableName: string,
    private items: (Check | Put | Delete | Update)[],
  ) {
    super(databaseClient, tableName);
  }

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
          default:
            return { ConditionCheck: { Key, ...baseRequestInput } };
        }
      }),
    };

    return AsyncRetry(async (bail, attempt) => {
      const shortCircuit = createShortCircuit({
        duration: attempt * LONG_MAX_LATENCY * (this.patienceRatio || 1),
        error: new Error(TAKING_TOO_LONG_EXCEPTION),
      });
      try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { $metadata, ...output } = await Promise.race([
          this.databaseClient.send(new TransactWriteItemsCommand(requestInput)),
          shortCircuit.launch(),
        ]);

        return output;
      } catch (error) {
        if (!isRetryableError(error)) {
          bail(error);
          return;
        }
        throw error;
      } finally {
        shortCircuit.halt();
      }
    }, RETRY_OPTIONS);
  };
}
