import {
  DynamoDBClient,
  UpdateTimeToLiveCommand,
  UpdateTimeToLiveInput,
} from "@aws-sdk/client-dynamodb";
import AsyncRetry from "async-retry";

import {
  BUILD,
  createShortCircuit,
  isRetryableError,
  RETRY_OPTIONS,
  SHORT_MAX_LATENCY,
  TAKING_TOO_LONG_EXCEPTION,
} from "../../utils/misc-utils";
import { Request } from "../_core/request";

export class TableTTLUpdate extends Request {
  constructor(
    protected readonly client: DynamoDBClient,
    protected parameters: UpdateTimeToLiveInput,
  ) {
    super();
  }

  [BUILD](): UpdateTimeToLiveInput {
    return { ...this.parameters };
  }

  /**
   * Execute the Update Table TTL request
   */
  $ = async () => {
    const requestInput = this[BUILD]();
    return AsyncRetry(async (bail, attempt) => {
      const shortCircuit = createShortCircuit({
        duration: attempt * SHORT_MAX_LATENCY * this.patienceRatio,
        error: new Error(TAKING_TOO_LONG_EXCEPTION),
      });
      try {
        const { TimeToLiveSpecification } = await Promise.race([
          this.client.send(new UpdateTimeToLiveCommand(requestInput)),
          shortCircuit.launch(),
        ]);
        return { data: TimeToLiveSpecification };
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
