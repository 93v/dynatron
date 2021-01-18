import {
  DescribeTableCommand,
  DescribeTableInput,
  DynamoDBClient,
} from "@aws-sdk/client-dynamodb";
import retry from "async-retry";

import {
  MARSHALL_REQUEST,
  RETRY_OPTIONS,
  SHORT_MAX_LATENCY,
  TAKING_TOO_LONG_EXCEPTION,
} from "../../utils/constants";
import { isRetryableError } from "../../utils/misc-utils";
import { createShortCircuit } from "../../utils/short-circuit";

export class TableDescribe {
  constructor(
    protected readonly client: DynamoDBClient,
    protected tableName: string,
  ) {}

  [MARSHALL_REQUEST](): DescribeTableInput {
    return { TableName: this.tableName };
  }

  $execute = async () => {
    const requestInput = this[MARSHALL_REQUEST]();
    return retry(async (bail, attempt) => {
      const shortCircuit = createShortCircuit({
        duration: attempt * SHORT_MAX_LATENCY,
        error: new Error(TAKING_TOO_LONG_EXCEPTION),
      });
      try {
        const output = await Promise.race([
          this.client.send(new DescribeTableCommand(requestInput)),
          shortCircuit.launch(),
        ]);
        return output.Table;
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

  $ = this.$execute;
}
