import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { Amend } from "../src/requesters/2-amend";
import { BatchPut } from "../src/requesters/2.3-batch-put";
import { initializeDatabaseClient } from "../src/utils/database-client";

let databaseClient: DynamoDBClient;

beforeAll(() => {
  databaseClient = initializeDatabaseClient();
});

describe("BatchPut", () => {
  test("should be an instance of Amend", () => {
    const instance = new BatchPut(databaseClient, "");
    expect(instance).toBeInstanceOf(Amend);
  });

  test("should be an instance of BatchPut", () => {
    const instance = new BatchPut(databaseClient, "");
    expect(instance).toBeInstanceOf(BatchPut);
  });
});
