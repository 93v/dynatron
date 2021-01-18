import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { NativeKey } from "../../types/native-types";
import { Amend } from "./items/2-amend";

export class BatchDelete extends Amend {
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
