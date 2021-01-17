import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { Reader } from "../src/requesters/1-reader";
import { BatchGetter } from "../src/requesters/1.2-batch-getter";
import { initializeDatabaseClient } from "../src/utils/database-client";

let databaseClient: DynamoDBClient;

beforeAll(() => {
  databaseClient = initializeDatabaseClient();
});

describe("BatchGetter", () => {
  test("should be an instance of Reader", () => {
    const instance = new BatchGetter(databaseClient, "");
    expect(instance).toBeInstanceOf(Reader);
  });

  test("should be an instance of BatchGetter", () => {
    const instance = new BatchGetter(databaseClient, "");
    expect(instance).toBeInstanceOf(BatchGetter);
  });
});
