import AsyncRetry from "async-retry";

import { CreateTableCommand, CreateTableInput } from "@aws-sdk/client-dynamodb";

import { Request } from "../_core/request";
import { DynatronClient } from "../../dynatron";
import {
  BUILD,
  createShortCircuit,
  isRetryableError,
  LONG_MAX_LATENCY,
  RETRY_OPTIONS,
  TAKING_TOO_LONG_EXCEPTION,
} from "../../utils/misc-utils";

export class TableCreate extends Request {
  constructor(
    protected readonly client: DynatronClient,
    protected parameters: CreateTableInput,
  ) {
    super();
  }

  [BUILD](): CreateTableInput {
    return { ...this.parameters };
  }

  /**
   * Execute the Create Table request
   */
  $ = async () => {
    const requestInput = this[BUILD]();
    return AsyncRetry(async (bail, attempt) => {
      const shortCircuit = createShortCircuit({
        duration: attempt * LONG_MAX_LATENCY * this.patienceRatio,
        error: new Error(TAKING_TOO_LONG_EXCEPTION),
      });
      try {
        const { TableDescription } = await Promise.race([
          this.client.send(new CreateTableCommand(requestInput)),
          shortCircuit.launch(),
        ]);
        return { data: TableDescription };
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
