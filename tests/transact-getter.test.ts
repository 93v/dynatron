import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { Requester } from "../src/requesters/0-requester";
import { TransactGetter } from "../src/requesters/3-transact-getter";
import { initializeDatabaseClient } from "../src/utils/database-client";

let databaseClient: DynamoDBClient;

beforeAll(() => {
  databaseClient = initializeDatabaseClient();
});

describe("TransactGetter", () => {
  test("should be an instance of Requester", () => {
    const instance = new TransactGetter(databaseClient, "");
    expect(instance).toBeInstanceOf(Requester);
  });

  test("should be an instance of TransactGetter", () => {
    const instance = new TransactGetter(databaseClient, "");
    expect(instance).toBeInstanceOf(TransactGetter);
  });
});
