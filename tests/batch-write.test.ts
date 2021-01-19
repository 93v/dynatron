import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { Amend } from "../src/requesters/items/2-amend";
import { BatchWrite } from "../src/requesters/items/2.2-batch-write";
import { initializeDatabaseClient } from "../src/utils/database-client";

let databaseClient: DynamoDBClient;

beforeAll(() => {
  databaseClient = initializeDatabaseClient();
});

describe("BatchWrite", () => {
  test("should be an instance of Amend", () => {
    const instance = new BatchWrite(databaseClient, "", []);
    expect(instance).toBeInstanceOf(Amend);
  });

  test("should be an instance of BatchWrite", () => {
    const instance = new BatchWrite(databaseClient, "", []);
    expect(instance).toBeInstanceOf(BatchWrite);
  });
});
