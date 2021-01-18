import {
  DynamoDBClient,
  ReturnConsumedCapacity,
} from "@aws-sdk/client-dynamodb";

import { BUILD } from "../utils/constants";

export class Request {
  #ReturnConsumedCapacity?: ReturnConsumedCapacity;
  protected patienceRatio = 1;

  constructor(
    protected readonly databaseClient: DynamoDBClient,
    protected tableName: string,
  ) {}

  returnConsumedCapacity = (
    returnConsumedCapacity: ReturnConsumedCapacity = "TOTAL",
  ) => {
    this.#ReturnConsumedCapacity = returnConsumedCapacity;
    return this;
  };

  relaxLatencies = (patienceRatio = 1) => {
    if (patienceRatio <= 0) {
      throw new Error("The ratio must be positive");
    }
    this.patienceRatio = Math.abs(patienceRatio);
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
