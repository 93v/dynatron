import {
  DeleteTableCommand,
  DeleteTableCommandOutput,
  DeleteTableInput,
  DynamoDBClient,
} from "@aws-sdk/client-dynamodb";
import AsyncRetry from "async-retry";

import {
  BUILD,
  createShortCircuit,
  isRetryableError,
  LONG_MAX_LATENCY,
  RETRY_OPTIONS,
  TAKING_TOO_LONG_EXCEPTION,
} from "../../utils/misc-utils";
import { TableRequest } from "./0-table-request";

export class TableDelete extends TableRequest {
  constructor(
    protected readonly client: DynamoDBClient,
    protected tableName: string,
  ) {
    super();
  }

  [BUILD](): DeleteTableInput {
    return { TableName: this.tableName };
  }

  /**
   * Execute the Delete Table request
   */
  $ = async () => {
    const requestInput = this[BUILD]();
    return AsyncRetry(async (bail, attempt): Promise<
      DeleteTableCommandOutput["TableDescription"] | void
    > => {
      const shortCircuit = createShortCircuit({
        duration: attempt * LONG_MAX_LATENCY * this.patienceRatio,
        error: new Error(TAKING_TOO_LONG_EXCEPTION),
      });
      try {
        const output = await Promise.race([
          this.client.send(new DeleteTableCommand(requestInput)),
          shortCircuit.launch(),
        ]);
        return output.TableDescription;
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
