import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { ConditionChecker } from "../src/requesters/2.1-condition-checker";
import { Deleter } from "../src/requesters/2.1.1-deleter";
import { initializeDatabaseClient } from "../src/utils/database-client";

let databaseClient: DynamoDBClient;

beforeAll(() => {
  databaseClient = initializeDatabaseClient();
});

describe("Deleter", () => {
  test("should be an instance of ConditionChecker", () => {
    const instance = new Deleter(databaseClient, "");
    expect(instance).toBeInstanceOf(ConditionChecker);
  });

  test("should be an instance of Deleter", () => {
    const instance = new Deleter(databaseClient, "");
    expect(instance).toBeInstanceOf(Deleter);
  });
});
