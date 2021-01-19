import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { Fetch } from "../src/requesters/items/1-fetch";
import { BatchGet } from "../src/requesters/items/1.2-batch-get";
import { initializeDatabaseClient } from "../src/utils/database-client";

let databaseClient: DynamoDBClient;

beforeAll(() => {
  databaseClient = initializeDatabaseClient();
});

describe("BatchGet", () => {
  test("should be an instance of Fetch", () => {
    const instance = new BatchGet(databaseClient, "", []);
    expect(instance).toBeInstanceOf(Fetch);
  });

  test("should be an instance of BatchGet", () => {
    const instance = new BatchGet(databaseClient, "", []);
    expect(instance).toBeInstanceOf(BatchGet);
  });
});
