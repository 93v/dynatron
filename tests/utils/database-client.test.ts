import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { initializeDatabaseClient } from "../../src/utils/database-client";

describe("Database Client", () => {
  test("should return an instance of DynamoDBClient", () => {
    const instance = initializeDatabaseClient();
    expect(instance).toBeInstanceOf(DynamoDBClient);
  });

  test("should return an instance of DynamoDBClient", () => {
    const instance = initializeDatabaseClient({});
    expect(instance).toBeInstanceOf(DynamoDBClient);
  });

  test("should return an instance of DynamoDBClient", () => {
    const instance = initializeDatabaseClient({ timeout: 1000 });
    expect(instance).toBeInstanceOf(DynamoDBClient);
  });

  test("should return an instance of DynamoDBClient", () => {
    const instance = initializeDatabaseClient({ region: "local" });
    expect(instance).toBeInstanceOf(DynamoDBClient);
  });

  test("should return an instance of DynamoDBClient", () => {
    const instance = initializeDatabaseClient({ region: "localhost" });
    expect(instance).toBeInstanceOf(DynamoDBClient);
  });
});
