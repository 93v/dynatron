import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { Request } from "../src/requesters/0-request";
import { BUILD } from "../src/utils/constants";
import { initializeDatabaseClient } from "../src/utils/database-client";

let databaseClient: DynamoDBClient;

beforeAll(() => {
  databaseClient = initializeDatabaseClient();
});

describe("Request", () => {
  test("should be an instance of Request", () => {
    const instance = new Request(databaseClient, "");
    expect(instance).toBeInstanceOf(Request);
  });

  test("method call should return itself", () => {
    const instance = new Request(databaseClient, "");
    expect(instance.returnConsumedCapacity("INDEXES")).toBe(instance);
  });

  test("should build empty", () => {
    expect(new Request(databaseClient, "")[BUILD]()).toMatchObject({});
  });

  test("should build with ReturnConsumedCapacity", () => {
    const instance = new Request(databaseClient, "");
    instance.returnConsumedCapacity("INDEXES");
    expect(instance[BUILD]()).toMatchObject({
      ReturnConsumedCapacity: "INDEXES",
    });
  });

  test("should build with ReturnConsumedCapacity", () => {
    const instance = new Request(databaseClient, "");
    instance.returnConsumedCapacity("NONE");
    expect(instance[BUILD]()).toMatchObject({
      ReturnConsumedCapacity: "NONE",
    });
  });

  test("should build with ReturnConsumedCapacity", () => {
    const instance = new Request(databaseClient, "");
    instance.returnConsumedCapacity("TOTAL");
    expect(instance[BUILD]()).toMatchObject({
      ReturnConsumedCapacity: "TOTAL",
    });
  });
});
