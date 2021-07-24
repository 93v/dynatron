import {
  DescribeTableCommand,
  DescribeTableInput,
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
import { TableRequest } from "../_core/table-request";

export class TableDescribe extends TableRequest {
  constructor(
    protected readonly client: DynamoDBClient,
    protected tableName: string,
  ) {
    super();
  }

  [BUILD](): DescribeTableInput {
    return { TableName: this.tableName };
  }

  /**
   * Execute the Describe Table request
   */
  $ = async () => {
    const requestInput = this[BUILD]();
    return AsyncRetry(async (bail, attempt) => {
      const shortCircuit = createShortCircuit({
        duration: attempt * SHORT_MAX_LATENCY * this.patienceRatio,
        error: new Error(TAKING_TOO_LONG_EXCEPTION),
      });
      try {
        const { Table } = await Promise.race([
          this.client.send(new DescribeTableCommand(requestInput)),
          shortCircuit.launch(),
        ]);
        return Table;
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
