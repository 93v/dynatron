import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { NativeValue } from "../../types/native-types";
import { Amend } from "./items/2-amend";

export class BatchPut extends Amend {
  constructor(
    databaseClient: DynamoDBClient,
    tableName: string,
    private items: NativeValue[],
  ) {
    super(databaseClient, tableName);
    // eslint-disable-next-line no-console
    console.log(this.items);
  }
}
