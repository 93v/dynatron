import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { Amend } from "../src/requesters/2-amend";
import { TransactWrite } from "../src/requesters/2.4-transact-write";
import { initializeDatabaseClient } from "../src/utils/database-client";

let databaseClient: DynamoDBClient;

beforeAll(() => {
  databaseClient = initializeDatabaseClient();
});

describe("TransactWrite", () => {
  test("should be an instance of Amend", () => {
    const instance = new TransactWrite(databaseClient, "");
    expect(instance).toBeInstanceOf(Amend);
  });

  test("should be an instance of TransactWrite", () => {
    const instance = new TransactWrite(databaseClient, "");
    expect(instance).toBeInstanceOf(TransactWrite);
  });
});
