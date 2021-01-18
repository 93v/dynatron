import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { Amend } from "../src/requesters/items/2-amend";
import { Check } from "../src/requesters/items/2.1-check";
import { initializeDatabaseClient } from "../src/utils/database-client";

let databaseClient: DynamoDBClient;

beforeAll(() => {
  databaseClient = initializeDatabaseClient();
});

describe("Check", () => {
  test("should be an instance of Amend", () => {
    const instance = new Check(databaseClient, "");
    expect(instance).toBeInstanceOf(Amend);
  });

  test("should be an instance of Check", () => {
    const instance = new Check(databaseClient, "");
    expect(instance).toBeInstanceOf(Check);
  });
});
