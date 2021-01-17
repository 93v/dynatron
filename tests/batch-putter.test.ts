import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { Mutator } from "../src/requesters/2-mutator";
import { BatchPutter } from "../src/requesters/2.3-batch-putter";
import { initializeDatabaseClient } from "../src/utils/database-client";

let databaseClient: DynamoDBClient;

beforeAll(() => {
  databaseClient = initializeDatabaseClient();
});

describe("BatchPutter", () => {
  test("should be an instance of Mutator", () => {
    const instance = new BatchPutter(databaseClient, "");
    expect(instance).toBeInstanceOf(Mutator);
  });

  test("should be an instance of BatchPutter", () => {
    const instance = new BatchPutter(databaseClient, "");
    expect(instance).toBeInstanceOf(BatchPutter);
  });
});
