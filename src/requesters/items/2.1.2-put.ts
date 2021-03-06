import {
  DynamoDBClient,
  PutItemCommand,
  PutItemCommandInput,
  PutItemOutput,
} from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import AsyncRetry from "async-retry";

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
import { Check } from "./2.1-check";

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
   * @param returnRawResponse boolean
   */
  $ = async <T = NativeValue | undefined, U extends boolean = false>(
    returnRawResponse?: U,
  ): Promise<U extends true ? PutItemOutput : T | undefined> => {
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
        const { $metadata, ...output } = await Promise.race([
          this.databaseClient.send(new PutItemCommand(requestInput)),
          shortCircuit.launch(),
        ]);

        return (
          returnRawResponse
            ? output
            : requestInput.Item && unmarshall(requestInput.Item)
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
