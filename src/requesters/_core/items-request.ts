import {
  DynamoDBClient,
  ReturnConsumedCapacity,
} from "@aws-sdk/client-dynamodb";

import { BUILD } from "../../utils/misc-utils";

export class Request {
  protected ReturnConsumedCapacity: ReturnConsumedCapacity = "INDEXES";
  protected patienceRatio = 1;

  constructor(
    protected readonly databaseClient: DynamoDBClient,
    protected tableName?: string,
  ) {}

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
      ReturnConsumedCapacity: this.ReturnConsumedCapacity,
      TableName: this.tableName,
    };
  }
}
