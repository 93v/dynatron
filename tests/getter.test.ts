import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { Reader } from "../src/requesters/1-reader";
import { Getter } from "../src/requesters/1.1-getter";
import { initializeDatabaseClient } from "../src/utils/database-client";

let databaseClient: DynamoDBClient;

beforeAll(() => {
  databaseClient = initializeDatabaseClient();
});

describe("Getter", () => {
  test("should be an instance of Reader", () => {
    const instance = new Getter(databaseClient, "", { id: 0 });
    expect(instance).toBeInstanceOf(Reader);
  });

  test("should be an instance of Getter", () => {
    const instance = new Getter(databaseClient, "", { id: 0 });
    expect(instance).toBeInstanceOf(Getter);
  });
});
