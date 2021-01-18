import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { Check } from "../src/requesters/2.1-check";
import { Delete } from "../src/requesters/2.1.1-delete";
import { initializeDatabaseClient } from "../src/utils/database-client";

let databaseClient: DynamoDBClient;

beforeAll(() => {
  databaseClient = initializeDatabaseClient();
});

describe("Delete", () => {
  test("should be an instance of Check", () => {
    const instance = new Delete(databaseClient, "");
    expect(instance).toBeInstanceOf(Check);
  });

  test("should be an instance of Delete", () => {
    const instance = new Delete(databaseClient, "");
    expect(instance).toBeInstanceOf(Delete);
  });
});
