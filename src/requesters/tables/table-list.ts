import {
  DynamoDBClient,
  ListTablesCommand,
  ListTablesInput,
  ListTablesOutput,
} from "@aws-sdk/client-dynamodb";
import retry from "async-retry";

import {
  MARSHALL_REQUEST,
  LONG_MAX_LATENCY,
  RETRY_OPTIONS,
  TAKING_TOO_LONG_EXCEPTION,
} from "../../utils/constants";
import { isRetryableError } from "../../utils/misc-utils";
import { createShortCircuit } from "../../utils/short-circuit";

export class TableList {
  #Limit?: number;
  #ExclusiveStartTableName?: string;

  constructor(protected readonly client: DynamoDBClient) {}

  limit = (parameters: { limit: number; exclusiveStartTableName?: string }) => {
    if (
      parameters.limit <= 0 ||
      !Number.isInteger(parameters.limit) ||
      parameters.limit > 100
    ) {
      throw new Error(
        "The limit must be a positive integer less than or equal to 100",
      );
    }

    this.#Limit = parameters.limit;
    this.#ExclusiveStartTableName = parameters.exclusiveStartTableName;
    return this;
  };

  [MARSHALL_REQUEST](): ListTablesInput {
    return {
      ...(this.#Limit && { Limit: this.#Limit }),
      ...(this.#ExclusiveStartTableName && {
        ExclusiveStartTableName: this.#ExclusiveStartTableName,
      }),
    };
  }

  $execute = async () => {
    const requestInput = this[MARSHALL_REQUEST]();

    let operationCompleted = false;

    const aggregatedResponse: ListTablesOutput = {};

    return retry(async (bail, attempt) => {
      while (!operationCompleted) {
        const shortCircuit = createShortCircuit({
          duration: attempt * LONG_MAX_LATENCY,
          error: new Error(TAKING_TOO_LONG_EXCEPTION),
        });

        try {
          const output = await Promise.race([
            this.client.send(new ListTablesCommand(requestInput)),
            shortCircuit.launch(),
          ]);

          if (output == undefined) {
            operationCompleted = true;
            return;
          }

          if (output.LastEvaluatedTableName == undefined) {
            operationCompleted = true;
          } else {
            requestInput.ExclusiveStartTableName =
              output.LastEvaluatedTableName;
          }

          if (output.TableNames) {
            aggregatedResponse.TableNames = [
              ...(aggregatedResponse.TableNames || []),
              ...output.TableNames,
            ];
          }

          if (
            requestInput.Limit &&
            (aggregatedResponse.TableNames?.length || 0) >= requestInput.Limit
          ) {
            aggregatedResponse.TableNames = aggregatedResponse.TableNames?.slice(
              0,
              requestInput.Limit,
            );
            operationCompleted = true;
          }
        } catch (error) {
          if (!isRetryableError(error)) {
            bail(error);
            return;
          }
          throw error;
        } finally {
          shortCircuit.halt();
        }
      }
      return aggregatedResponse.TableNames;
    }, RETRY_OPTIONS);
  };

  $ = this.$execute;
}
