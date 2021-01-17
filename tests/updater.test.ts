import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { ConditionChecker } from "../src/requesters/2.1-condition-checker";
import { Updater } from "../src/requesters/2.1.3-updater";
import { initializeDatabaseClient } from "../src/utils/database-client";

let databaseClient: DynamoDBClient;

beforeAll(() => {
  databaseClient = initializeDatabaseClient();
});

describe("Updater", () => {
  test("should be an instance of ConditionChecker", () => {
    const instance = new Updater(databaseClient, "");
    expect(instance).toBeInstanceOf(ConditionChecker);
  });

  test("should be an instance of Updater", () => {
    const instance = new Updater(databaseClient, "");
    expect(instance).toBeInstanceOf(Updater);
  });
});
