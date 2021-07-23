import {
  DeleteItemCommand,
  DeleteItemCommandInput,
  DeleteItemOutput,
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
import { Check } from "../_core/items-check";

export class Delete extends Check {
  /**
   * Execute the Delete request
   */
  $ = async <T = NativeValue | undefined>(): Promise<
    ({ data: T | undefined } & Omit<DeleteItemOutput, "Attributes">) | undefined
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
        const { $metadata, ...output } = await Promise.race([
          this.databaseClient.send(new DeleteItemCommand(requestInput)),
          shortCircuit.launch(),
        ]);

        return {
          ConsumedCapacity: output.ConsumedCapacity,
          ItemCollectionMetrics: output.ItemCollectionMetrics,
          data: output.Attributes && (unmarshall(output.Attributes) as T),
        };
      } catch (error) {
        if (isRetryableError(error)) {
          throw error;
        }
        error.$input = requestInput;
        bail(error);
      } finally {
        shortCircuit.halt();
      }
      return;
    }, RETRY_OPTIONS);
  };
}
