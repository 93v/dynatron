import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { Mutator } from "../src/requesters/2-mutator";
import { ConditionChecker } from "../src/requesters/2.1-condition-checker";
import { initializeDatabaseClient } from "../src/utils/database-client";

let databaseClient: DynamoDBClient;

beforeAll(() => {
  databaseClient = initializeDatabaseClient();
});

describe("ConditionChecker", () => {
  test("should be an instance of Mutator", () => {
    const instance = new ConditionChecker(databaseClient, "");
    expect(instance).toBeInstanceOf(Mutator);
  });

  test("should be an instance of ConditionChecker", () => {
    const instance = new ConditionChecker(databaseClient, "");
    expect(instance).toBeInstanceOf(ConditionChecker);
  });
});
