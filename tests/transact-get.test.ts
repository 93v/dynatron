import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { Request } from "../src/requesters/items/0-request";
import { TransactGet } from "../src/requesters/items/3-transact-get";
import { initializeDatabaseClient } from "../src/utils/database-client";

let databaseClient: DynamoDBClient;

beforeAll(() => {
  databaseClient = initializeDatabaseClient();
});

describe("TransactGet", () => {
  test("should be an instance of Request", () => {
    const instance = new TransactGet(databaseClient, "", []);
    expect(instance).toBeInstanceOf(Request);
  });

  test("should be an instance of TransactGet", () => {
    const instance = new TransactGet(databaseClient, "", []);
    expect(instance).toBeInstanceOf(TransactGet);
  });
});
