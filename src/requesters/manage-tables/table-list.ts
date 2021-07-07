import {
  DynamoDBClient,
  ListTablesCommand,
  ListTablesInput,
  ListTablesOutput,
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
import { TableRequest } from "../_core/table-request";

export class TableList extends TableRequest {
  #Limit?: number;
  #ExclusiveStartTableName?: string;

  constructor(protected readonly client: DynamoDBClient) {
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
          const output = await Promise.race([
            this.client.send(new ListTablesCommand(requestInput)),
            shortCircuit.launch(),
          ]);

          if (output.LastEvaluatedTableName == undefined) {
            operationCompleted = true;
          } else {
            requestInput.ExclusiveStartTableName =
              output.LastEvaluatedTableName;
          }

          if (output.TableNames) {
            aggregatedResponse.TableNames = [
              ...(aggregatedResponse.TableNames ?? []),
              ...output.TableNames,
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
        } catch (error) {
          if (isRetryableError(error)) {
            throw error;
          }
          operationCompleted = true;
          error.$input = requestInput;
          bail(error);
        } finally {
          shortCircuit.halt();
        }
      }
      return aggregatedResponse.TableNames;
    }, RETRY_OPTIONS);
  };
}
