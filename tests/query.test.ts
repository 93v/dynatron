import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { ListFetch } from "../src/requesters/1.3-list-fetch";
import { Query } from "../src/requesters/1.3.1-query";
import { initializeDatabaseClient } from "../src/utils/database-client";

let databaseClient: DynamoDBClient;

beforeAll(() => {
  databaseClient = initializeDatabaseClient();
});

describe("Query", () => {
  test("should be an instance of ListFetch", () => {
    const instance = new Query(databaseClient, "");
    expect(instance).toBeInstanceOf(ListFetch);
  });

  test("should be an instance of Query", () => {
    const instance = new Query(databaseClient, "");
    expect(instance).toBeInstanceOf(Query);
  });
});
