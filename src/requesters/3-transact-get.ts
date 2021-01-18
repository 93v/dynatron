import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { Request } from "./items/0-request";
import { Get } from "./items/1.1-get";

export class TransactGet extends Request {
  constructor(
    databaseClient: DynamoDBClient,
    tableName: string,
    private items: Get[],
  ) {
    super(databaseClient, tableName);
    // eslint-disable-next-line no-console
    console.log(this.items);
  }
}
