import { ReturnConsumedCapacity } from "@aws-sdk/client-dynamodb";

import { DynatronClient } from "../../dynatron";
import { BUILD } from "../../utils/misc-utils";
import { Request } from "./request";

export class ItemRequest extends Request {
  protected ReturnConsumedCapacity: ReturnConsumedCapacity;
  constructor(
    protected readonly databaseClient: DynatronClient,
    protected tableName?: string,
  ) {
    super();
    this.ReturnConsumedCapacity = this.databaseClient.returnMetrics
      ? ReturnConsumedCapacity.INDEXES
      : ReturnConsumedCapacity.NONE;
  }

  /**
   * Determines the level of detail about provisioned throughput consumption in the response.
   * @param returnConsumedCapacity "INDEXES" | "TOTAL" | "NONE"
   */
  returnConsumedCapacity = (
    returnConsumedCapacity: ReturnConsumedCapacity = ReturnConsumedCapacity.TOTAL,
  ) => {
    this.ReturnConsumedCapacity = returnConsumedCapacity;
    return this;
  };

  [BUILD]() {
    return {
      ReturnConsumedCapacity: this.ReturnConsumedCapacity,
      TableName: this.tableName,
    };
  }
}
