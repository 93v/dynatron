import {
  DynamoDBClient,
  ReturnConsumedCapacity,
} from "@aws-sdk/client-dynamodb";

import { BUILD } from "../../utils/misc-utils";

export class Request {
  #ReturnConsumedCapacity?: ReturnConsumedCapacity;
  protected patienceRatio = 1;

  constructor(
    protected readonly databaseClient: DynamoDBClient,
    protected tableName?: string,
  ) {}

  /**
   * Determines the level of detail about provisioned throughput consumption in the response.
   * @param returnConsumedCapacity "INDEXES" | "TOTAL" | "NONE"
   */
  returnConsumedCapacity = (
    returnConsumedCapacity: ReturnConsumedCapacity = "TOTAL",
  ) => {
    this.#ReturnConsumedCapacity = returnConsumedCapacity;
    return this;
  };

  /**
   * Modifies the requests timeouts latencies by the provided ratio.
   * @param patienceRatio number
   */
  relaxLatencies = (patienceRatio = 1) => {
    this.patienceRatio = patienceRatio <= 0 ? 1 : patienceRatio;
    return this;
  };

  [BUILD]() {
    return {
      ...(this.#ReturnConsumedCapacity && {
        ReturnConsumedCapacity: this.#ReturnConsumedCapacity,
      }),
      TableName: this.tableName,
    };
  }
}
