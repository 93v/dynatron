import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { CollectionGetter } from "../src/requesters/1.3-collection-getter";
import { Scanner } from "../src/requesters/1.3.2-scanner";
import { initializeDatabaseClient } from "../src/utils/database-client";

let databaseClient: DynamoDBClient;

beforeAll(() => {
  databaseClient = initializeDatabaseClient();
});

describe("Scanner", () => {
  test("should be an instance of CollectionGetter", () => {
    const instance = new Scanner(databaseClient, "");
    expect(instance).toBeInstanceOf(CollectionGetter);
  });

  test("should be an instance of Scanner", () => {
    const instance = new Scanner(databaseClient, "");
    expect(instance).toBeInstanceOf(Scanner);
  });
});
