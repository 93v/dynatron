import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { Check } from "../src/requesters/2.1-check";
import { Put } from "../src/requesters/2.1.2-put";
import { initializeDatabaseClient } from "../src/utils/database-client";

let databaseClient: DynamoDBClient;

beforeAll(() => {
  databaseClient = initializeDatabaseClient();
});

describe("Put", () => {
  test("should be an instance of Check", () => {
    const instance = new Put(databaseClient, "", {});
    expect(instance).toBeInstanceOf(Check);
  });

  test("should be an instance of Put", () => {
    const instance = new Put(databaseClient, "", {});
    expect(instance).toBeInstanceOf(Put);
  });
});
