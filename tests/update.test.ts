import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { Check } from "../src/requesters/items/2.1-check";
import { Update } from "../src/requesters/2.1.3-update";
import { initializeDatabaseClient } from "../src/utils/database-client";

let databaseClient: DynamoDBClient;

beforeAll(() => {
  databaseClient = initializeDatabaseClient();
});

describe("Update", () => {
  test("should be an instance of Check", () => {
    const instance = new Update(databaseClient, "");
    expect(instance).toBeInstanceOf(Check);
  });

  test("should be an instance of Update", () => {
    const instance = new Update(databaseClient, "");
    expect(instance).toBeInstanceOf(Update);
  });
});
