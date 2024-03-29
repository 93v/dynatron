import AsyncRetry from "async-retry";

import {
  ListTablesCommand,
  ListTablesInput,
  ListTablesOutput,
} from "@aws-sdk/client-dynamodb";

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

export class TableList extends Request {
  #Limit?: number;
  #ExclusiveStartTableName?: string;

  constructor(protected readonly client: DynatronClient) {
    super();
  }

  /**
   * The maximum number of table names to return.
   * @param limit number
   */
  limit = (limit: number) => {
    if (limit <= 0 || !Number.isInteger(limit) || limit > 100) {
      throw new Error(
        "The limit must be a positive integer less than or equal to 100",
      );
    }

    this.#Limit = limit;
    return this;
  };

  /**
   * The name of the first table that this operation will evaluate.
   * @param exclusiveStartTableName string
   */
  start = (exclusiveStartTableName?: string) => {
    if (exclusiveStartTableName != undefined) {
      this.#ExclusiveStartTableName = exclusiveStartTableName;
    }
    return this;
  };

  [BUILD](): ListTablesInput {
    return {
      ...(this.#Limit && { Limit: this.#Limit }),
      ...(this.#ExclusiveStartTableName && {
        ExclusiveStartTableName: this.#ExclusiveStartTableName,
      }),
    };
  }

  /**
   * Execute the List Tables request
   */
  $ = async () => {
    const requestInput = this[BUILD]();

    let operationCompleted = false;

    const aggregatedResponse: ListTablesOutput = {};

    return AsyncRetry(async (bail, attempt) => {
      while (!operationCompleted) {
        const shortCircuit = createShortCircuit({
          duration: attempt * LONG_MAX_LATENCY * this.patienceRatio,
          error: new Error(TAKING_TOO_LONG_EXCEPTION),
        });

        try {
          const { LastEvaluatedTableName, TableNames } = await Promise.race([
            this.client.send(new ListTablesCommand(requestInput)),
            shortCircuit.launch(),
          ]);

          if (LastEvaluatedTableName == undefined) {
            operationCompleted = true;
          } else {
            requestInput.ExclusiveStartTableName = LastEvaluatedTableName;
          }

          if (TableNames) {
            aggregatedResponse.TableNames = [
              ...(aggregatedResponse.TableNames ?? []),
              ...TableNames,
            ];
          }

          if (
            requestInput.Limit &&
            aggregatedResponse.TableNames &&
            aggregatedResponse.TableNames.length >= requestInput.Limit
          ) {
            aggregatedResponse.TableNames = aggregatedResponse.TableNames.slice(
              0,
              requestInput.Limit,
            );
            operationCompleted = true;
          }
        } catch (error: unknown) {
          if (isRetryableError(error)) {
            throw error;
          }
          operationCompleted = true;
          (error as any).$input = requestInput;
          bail(error as Error);
        } finally {
          shortCircuit.halt();
        }
      }
      return { data: aggregatedResponse.TableNames };
    }, RETRY_OPTIONS);
  };
}
