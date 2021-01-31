import {
  DynamoDBClient,
  UpdateTimeToLiveCommand,
  UpdateTimeToLiveCommandOutput,
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
import { TableRequest } from "./0-table-request";

export class TableTTLUpdate extends TableRequest {
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
    return AsyncRetry(async (bail, attempt): Promise<
      UpdateTimeToLiveCommandOutput["TimeToLiveSpecification"] | void
    > => {
      const shortCircuit = createShortCircuit({
        duration: attempt * SHORT_MAX_LATENCY * this.patienceRatio,
        error: new Error(TAKING_TOO_LONG_EXCEPTION),
      });
      try {
        const output = await Promise.race([
          this.client.send(new UpdateTimeToLiveCommand(requestInput)),
          shortCircuit.launch(),
        ]);
        return output.TimeToLiveSpecification;
      } catch (error) {
        if (isRetryableError(error)) {
          throw error;
        }
        bail(error);
      } finally {
        shortCircuit.halt();
      }
    }, RETRY_OPTIONS);
  };
}
