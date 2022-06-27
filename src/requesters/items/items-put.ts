import AsyncRetry from "async-retry";

import {
  DynamoDBClient,
  PutItemCommand,
  PutItemCommandInput,
  PutItemOutput,
} from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

import { Check } from "../_core/items-check";
import { NativeValue } from "../../dynatron";
import {
  BUILD,
  createShortCircuit,
  isRetryableError,
  RETRY_OPTIONS,
  SHORT_MAX_LATENCY,
  TAKING_TOO_LONG_EXCEPTION,
} from "../../utils/misc-utils";
import { marshallRequestParameters } from "../../utils/request-marshaller";

export class Put extends Check {
  constructor(
    databaseClient: DynamoDBClient,
    tableName: string,
    private item: NativeValue,
  ) {
    super(databaseClient, tableName);
  }

  [BUILD]() {
    return {
      ...super[BUILD](),
      _Item: this.item,
    };
  }

  /**
   * Execute the Put request
   */
  $ = async <T = NativeValue | undefined>(): Promise<
    { data: T | undefined } & Omit<PutItemOutput, "Attributes">
  > => {
    const requestInput = marshallRequestParameters<PutItemCommandInput>(
      this[BUILD](),
    );
    return AsyncRetry(async (bail, attempt) => {
      const shortCircuit = createShortCircuit({
        duration: attempt * SHORT_MAX_LATENCY * this.patienceRatio,
        error: new Error(TAKING_TOO_LONG_EXCEPTION),
      });
      try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { $metadata, Attributes, ...putOutput } = await Promise.race([
          this.databaseClient.send(new PutItemCommand(requestInput)),
          shortCircuit.launch(),
        ]);

        return {
          ...putOutput,
          data: requestInput.Item && (unmarshall(requestInput.Item) as T),
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
