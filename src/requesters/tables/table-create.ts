import {
  CreateTableCommand,
  CreateTableInput,
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

export class TableCreate extends TableRequest {
  constructor(
    protected readonly client: DynamoDBClient,
    protected parameters: CreateTableInput,
  ) {
    super();
  }

  [BUILD](): CreateTableInput {
    return { ...this.parameters };
  }

  $ = async () => {
    const requestInput = this[BUILD]();
    return AsyncRetry(async (bail, attempt) => {
      const shortCircuit = createShortCircuit({
        duration: attempt * LONG_MAX_LATENCY * this.patienceRatio,
        error: new Error(TAKING_TOO_LONG_EXCEPTION),
      });
      try {
        const output = await Promise.race([
          this.client.send(new CreateTableCommand(requestInput)),
          shortCircuit.launch(),
        ]);
        return output.TableDescription;
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
