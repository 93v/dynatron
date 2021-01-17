import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { Mutator } from "../src/requesters/2-mutator";
import { TransactWriter } from "../src/requesters/2.4-transact-writer";
import { initializeDatabaseClient } from "../src/utils/database-client";

let databaseClient: DynamoDBClient;

beforeAll(() => {
  databaseClient = initializeDatabaseClient();
});

describe("TransactWriter", () => {
  test("should be an instance of Mutator", () => {
    const instance = new TransactWriter(databaseClient, "");
    expect(instance).toBeInstanceOf(Mutator);
  });

  test("should be an instance of TransactWriter", () => {
    const instance = new TransactWriter(databaseClient, "");
    expect(instance).toBeInstanceOf(TransactWriter);
  });
});
