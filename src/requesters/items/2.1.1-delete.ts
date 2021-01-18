import {
  DeleteItemCommand,
  DeleteItemCommandInput,
  DeleteItemOutput,
} from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import AsyncRetry from "async-retry";

import { NativeValue } from "../../../types/native-types";
import {
  BUILD,
  RETRY_OPTIONS,
  SHORT_MAX_LATENCY,
  TAKING_TOO_LONG_EXCEPTION,
} from "../../utils/constants";
import { isRetryableError } from "../../utils/misc-utils";
import { marshallRequestParameters } from "../../utils/request-marshaller";
import { createShortCircuit } from "../../utils/short-circuit";
import { Check } from "./2.1-check";

export class Delete extends Check {
  $ = async <T = NativeValue | undefined, U extends boolean = false>(
    returnRawResponse?: U,
  ): Promise<U extends true ? DeleteItemOutput : T | undefined> => {
    const requestInput = marshallRequestParameters<DeleteItemCommandInput>(
      this[BUILD](),
    );
    return AsyncRetry(async (bail, attempt) => {
      const shortCircuit = createShortCircuit({
        duration: attempt * SHORT_MAX_LATENCY * (this.patienceRatio || 1),
        error: new Error(TAKING_TOO_LONG_EXCEPTION),
      });
      try {
        const { $metadata, ...output } = await Promise.race([
          this.databaseClient.send(new DeleteItemCommand(requestInput)),
          shortCircuit.launch(),
        ]);

        return (returnRawResponse
          ? output
          : output.Attributes && unmarshall(output.Attributes)) as any;
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
