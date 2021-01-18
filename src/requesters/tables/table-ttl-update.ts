import {
  DynamoDBClient,
  UpdateTimeToLiveCommand,
  UpdateTimeToLiveInput,
} from "@aws-sdk/client-dynamodb";
import AsyncRetry from "async-retry";

import {
  MARSHALL_REQUEST,
  RETRY_OPTIONS,
  SHORT_MAX_LATENCY,
  TAKING_TOO_LONG_EXCEPTION,
} from "../../utils/constants";
import { isRetryableError } from "../../utils/misc-utils";
import { createShortCircuit } from "../../utils/short-circuit";

export class TableTTLUpdate {
  constructor(
    protected readonly client: DynamoDBClient,
    protected parameters: UpdateTimeToLiveInput,
  ) {}

  [MARSHALL_REQUEST](): UpdateTimeToLiveInput {
    return { ...this.parameters };
  }

  $ = async () => {
    const requestInput = this[MARSHALL_REQUEST]();
    return AsyncRetry(async (bail, attempt) => {
      const shortCircuit = createShortCircuit({
        duration: attempt * SHORT_MAX_LATENCY,
        error: new Error(TAKING_TOO_LONG_EXCEPTION),
      });
      try {
        const output = await Promise.race([
          this.client.send(new UpdateTimeToLiveCommand(requestInput)),
          shortCircuit.launch(),
        ]);
        return output.TimeToLiveSpecification;
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
