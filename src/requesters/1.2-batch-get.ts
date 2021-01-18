import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { NativeKey } from "../../types/native-types";
import { Fetch } from "./items/1-fetch";

export class BatchGet extends Fetch {
  constructor(
    databaseClient: DynamoDBClient,
    tableName: string,
    private keys: NativeKey[],
  ) {
    super(databaseClient, tableName);
    // eslint-disable-next-line no-console
    console.log(this.keys);
  }
}
