import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { Mutator } from "../src/requesters/2-mutator";
import { BatchDeleter } from "../src/requesters/2.2-batch-deleter";
import { initializeDatabaseClient } from "../src/utils/database-client";

let databaseClient: DynamoDBClient;

beforeAll(() => {
  databaseClient = initializeDatabaseClient();
});

describe("BatchDeleter", () => {
  test("should be an instance of Mutator", () => {
    const instance = new BatchDeleter(databaseClient, "");
    expect(instance).toBeInstanceOf(Mutator);
  });

  test("should be an instance of BatchDeleter", () => {
    const instance = new BatchDeleter(databaseClient, "");
    expect(instance).toBeInstanceOf(BatchDeleter);
  });
});
