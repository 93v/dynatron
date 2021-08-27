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
import { Request } from "../_core/request";

export class TableDescribe extends Request {
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
        return { data: Table };
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
