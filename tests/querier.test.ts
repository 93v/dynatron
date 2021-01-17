import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { CollectionGetter } from "../src/requesters/1.3-collection-getter";
import { Querier } from "../src/requesters/1.3.1-querier";
import { initializeDatabaseClient } from "../src/utils/database-client";

let databaseClient: DynamoDBClient;

beforeAll(() => {
  databaseClient = initializeDatabaseClient();
});

describe("Querier", () => {
  test("should be an instance of CollectionGetter", () => {
    const instance = new Querier(databaseClient, "");
    expect(instance).toBeInstanceOf(CollectionGetter);
  });

  test("should be an instance of Querier", () => {
    const instance = new Querier(databaseClient, "");
    expect(instance).toBeInstanceOf(Querier);
  });
});
