import AsyncRetry from "async-retry";

import {
  GetItemCommand,
  GetItemCommandInput,
  GetItemOutput,
} from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

import { Fetch } from "../_core/items-fetch";
import { DynatronClient, NativeValue } from "../../dynatron";
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

export class Get extends Fetch {
  constructor(
    databaseClient: DynatronClient,
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
   */
  $ = async <T = NativeValue | undefined>(): Promise<
    { data: T | undefined } & Omit<GetItemOutput, "Item">
  > => {
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
        const { $metadata, Item, ...getOutput } = await Promise.race([
          this.databaseClient.send(new GetItemCommand(requestInput)),
          shortCircuit.launch(),
        ]);

        return {
          ...getOutput,
          data: (Item && unmarshall(Item)) as T,
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
