import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { NativeKey } from "../../types/key";
import { validateKey } from "../utils/key-validation";
import { Reader } from "./1-reader";

export class Getter extends Reader {
  constructor(DB: DynamoDBClient, tableName: string, private key: NativeKey) {
    super(DB, tableName);
    validateKey({ key: this.key });
  }

  $execute = async () => {
    // Pass
  };

  $ = this.$execute;
}
