import {
  DynamoDBClient,
  GetItemCommand,
  GetItemCommandInput,
  GetItemOutput,
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
  validateKey,
} from "../../utils/misc-utils";
import { marshallRequestParameters } from "../../utils/request-marshaller";
import { Fetch } from "../_core/items-fetch";

export class Get extends Fetch {
  constructor(
    databaseClient: DynamoDBClient,
    tableName: string,
    private key: NativeValue,
  ) {
    super(databaseClient, tableName);
    validateKey(key);
  }

  [BUILD]() {
    return {
      ...super[BUILD](),
      _Key: this.key,
    };
  }

  /**
   * Execute the Get request
   * @param returnRawResponse boolean
   */
  $ = async <T = NativeValue | undefined, U extends boolean = false>(
    returnRawResponse?: U,
  ): Promise<U extends true ? GetItemOutput : T | undefined> => {
    const requestInput = marshallRequestParameters<GetItemCommandInput>(
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
          this.databaseClient.send(new GetItemCommand(requestInput)),
          shortCircuit.launch(),
        ]);

        return (
          returnRawResponse ? output : output.Item && unmarshall(output.Item)
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
