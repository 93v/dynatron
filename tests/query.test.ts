import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { ListFetch } from "../src/requesters/items/1.3-list-fetch";
import { Query } from "../src/requesters/items/1.3.1-query";
import { equals } from "../src/utils/condition-expression-utils";
import { initializeDatabaseClient } from "../src/utils/database-client";

let databaseClient: DynamoDBClient;

beforeAll(() => {
  databaseClient = initializeDatabaseClient();
});

describe("Query", () => {
  test("should be an instance of ListFetch", () => {
    const instance = new Query(databaseClient, "", equals("", ""));
    expect(instance).toBeInstanceOf(ListFetch);
  });

  test("should be an instance of Query", () => {
    const instance = new Query(databaseClient, "", equals("", ""));
    expect(instance).toBeInstanceOf(Query);
  });
});
