import {
  DynamoDBClient,
  ReturnConsumedCapacity,
} from "@aws-sdk/client-dynamodb";

import { BUILD } from "../../utils/misc-utils";
import { Request } from "./request";

export class ItemRequest extends Request {
  protected ReturnConsumedCapacity: ReturnConsumedCapacity = "INDEXES";

  constructor(
    protected readonly databaseClient: DynamoDBClient,
    protected tableName?: string,
  ) {
    super();
  }

  /**
   * Determines the level of detail about provisioned throughput consumption in the response.
   * @param returnConsumedCapacity "INDEXES" | "TOTAL" | "NONE"
   */
  returnConsumedCapacity = (
    returnConsumedCapacity: ReturnConsumedCapacity = "TOTAL",
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
