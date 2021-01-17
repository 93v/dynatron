import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { ConditionChecker } from "../src/requesters/2.1-condition-checker";
import { Putter } from "../src/requesters/2.1.2-putter";
import { initializeDatabaseClient } from "../src/utils/database-client";

let databaseClient: DynamoDBClient;

beforeAll(() => {
  databaseClient = initializeDatabaseClient();
});

describe("Putter", () => {
  test("should be an instance of ConditionChecker", () => {
    const instance = new Putter(databaseClient, "");
    expect(instance).toBeInstanceOf(ConditionChecker);
  });

  test("should be an instance of Putter", () => {
    const instance = new Putter(databaseClient, "");
    expect(instance).toBeInstanceOf(Putter);
  });
});
