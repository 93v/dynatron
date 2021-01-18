import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { Fetch } from "../src/requesters/items/1-fetch";
import { ListFetch } from "../src/requesters/items/1.3-list-fetch";
import { initializeDatabaseClient } from "../src/utils/database-client";

let databaseClient: DynamoDBClient;

beforeAll(() => {
  databaseClient = initializeDatabaseClient();
});

describe("ListFetch", () => {
  test("should be an instance of Fetch", () => {
    const instance = new ListFetch(databaseClient, "");
    expect(instance).toBeInstanceOf(Fetch);
  });

  test("should be an instance of ListFetch", () => {
    const instance = new ListFetch(databaseClient, "");
    expect(instance).toBeInstanceOf(ListFetch);
  });
});
