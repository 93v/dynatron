import AsyncRetry from "async-retry";

import {
  DeleteItemCommand,
  DeleteItemCommandInput,
  DeleteItemOutput,
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

export class Delete extends Check {
  /**
   * Execute the Delete request
   */
  $ = async <T = NativeValue | undefined>(): Promise<
    { data: T | undefined } & Omit<DeleteItemOutput, "Attributes">
  > => {
    const requestInput = marshallRequestParameters<DeleteItemCommandInput>(
      this[BUILD](),
    );
    return AsyncRetry(async (bail, attempt) => {
      const shortCircuit = createShortCircuit({
        duration: attempt * SHORT_MAX_LATENCY * this.patienceRatio,
        error: new Error(TAKING_TOO_LONG_EXCEPTION),
      });
      try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { $metadata, Attributes, ...deleteOutput } = await Promise.race([
          this.databaseClient.send(new DeleteItemCommand(requestInput)),
          shortCircuit.launch(),
        ]);

        return {
          ...deleteOutput,
          data: Attributes && (unmarshall(Attributes) as T),
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
