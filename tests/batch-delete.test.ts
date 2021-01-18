import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { Amend } from "../src/requesters/2-amend";
import { BatchDelete } from "../src/requesters/2.2-batch-delete";
import { initializeDatabaseClient } from "../src/utils/database-client";

let databaseClient: DynamoDBClient;

beforeAll(() => {
  databaseClient = initializeDatabaseClient();
});

describe("BatchDelete", () => {
  test("should be an instance of Amend", () => {
    const instance = new BatchDelete(databaseClient, "");
    expect(instance).toBeInstanceOf(Amend);
  });

  test("should be an instance of BatchDelete", () => {
    const instance = new BatchDelete(databaseClient, "");
    expect(instance).toBeInstanceOf(BatchDelete);
  });
});
