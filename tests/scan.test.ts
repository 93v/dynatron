import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { ListFetch } from "../src/requesters/1.3-list-fetch";
import { Scan } from "../src/requesters/1.3.2-scan";
import { initializeDatabaseClient } from "../src/utils/database-client";

let databaseClient: DynamoDBClient;

beforeAll(() => {
  databaseClient = initializeDatabaseClient();
});

describe("Scan", () => {
  test("should be an instance of ListFetch", () => {
    const instance = new Scan(databaseClient, "");
    expect(instance).toBeInstanceOf(ListFetch);
  });

  test("should be an instance of Scan", () => {
    const instance = new Scan(databaseClient, "");
    expect(instance).toBeInstanceOf(Scan);
  });
});
