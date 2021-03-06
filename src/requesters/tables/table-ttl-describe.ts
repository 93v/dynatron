import {
  DescribeTimeToLiveCommand,
  DescribeTimeToLiveInput,
  DynamoDBClient,
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

export class TableTTLDescribe extends TableRequest {
  constructor(
    protected readonly client: DynamoDBClient,
    protected tableName: string,
  ) {
    super();
  }

  [BUILD](): DescribeTimeToLiveInput {
    return { TableName: this.tableName };
  }

  /**
   * Execute the Describe Table TTL request
   */
  $ = async () => {
    const requestInput = this[BUILD]();
    return AsyncRetry(async (bail, attempt) => {
      const shortCircuit = createShortCircuit({
        duration: attempt * SHORT_MAX_LATENCY * this.patienceRatio,
        error: new Error(TAKING_TOO_LONG_EXCEPTION),
      });
      try {
        const output = await Promise.race([
          this.client.send(new DescribeTimeToLiveCommand(requestInput)),
          shortCircuit.launch(),
        ]);
        return output.TimeToLiveDescription;
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
