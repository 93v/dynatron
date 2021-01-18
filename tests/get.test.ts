import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { Fetch } from "../src/requesters/items/1-fetch";
import { Get } from "../src/requesters/items/1.1-get";
import { initializeDatabaseClient } from "../src/utils/database-client";

let databaseClient: DynamoDBClient;

beforeAll(() => {
  databaseClient = initializeDatabaseClient();
});

describe("Get", () => {
  test("should be an instance of Fetch", () => {
    const instance = new Get(databaseClient, "", { id: 0 });
    expect(instance).toBeInstanceOf(Fetch);
  });

  test("should be an instance of Get", () => {
    const instance = new Get(databaseClient, "", { id: 0 });
    expect(instance).toBeInstanceOf(Get);
  });
});
