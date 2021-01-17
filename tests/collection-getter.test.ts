import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { Reader } from "../src/requesters/1-reader";
import { CollectionGetter } from "../src/requesters/1.3-collection-getter";
import { initializeDatabaseClient } from "../src/utils/database-client";

let databaseClient: DynamoDBClient;

beforeAll(() => {
  databaseClient = initializeDatabaseClient();
});

describe("CollectionGetter", () => {
  test("should be an instance of Reader", () => {
    const instance = new CollectionGetter(databaseClient, "");
    expect(instance).toBeInstanceOf(Reader);
  });

  test("should be an instance of CollectionGetter", () => {
    const instance = new CollectionGetter(databaseClient, "");
    expect(instance).toBeInstanceOf(CollectionGetter);
  });
});
