import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { Requester } from "../src/requesters/0-requester";
import { BUILD } from "../src/utils/constants";
import { initializeDatabaseClient } from "../src/utils/database-client";

let databaseClient: DynamoDBClient;

beforeAll(() => {
  databaseClient = initializeDatabaseClient();
});

describe("Requester", () => {
  test("should be an instance of Requester", () => {
    const instance = new Requester(databaseClient, "");
    expect(instance).toBeInstanceOf(Requester);
  });

  test("method call should return itself", () => {
    const instance = new Requester(databaseClient, "");
    expect(instance.returnConsumedCapacity("INDEXES")).toBe(instance);
  });

  test("should build empty", () => {
    expect(new Requester(databaseClient, "")[BUILD]()).toMatchObject({});
  });

  test("should build with ReturnConsumedCapacity", () => {
    const instance = new Requester(databaseClient, "");
    instance.returnConsumedCapacity("INDEXES");
    expect(instance[BUILD]()).toMatchObject({
      ReturnConsumedCapacity: "INDEXES",
    });
  });

  test("should build with ReturnConsumedCapacity", () => {
    const instance = new Requester(databaseClient, "");
    instance.returnConsumedCapacity("NONE");
    expect(instance[BUILD]()).toMatchObject({
      ReturnConsumedCapacity: "NONE",
    });
  });

  test("should build with ReturnConsumedCapacity", () => {
    const instance = new Requester(databaseClient, "");
    instance.returnConsumedCapacity("TOTAL");
    expect(instance[BUILD]()).toMatchObject({
      ReturnConsumedCapacity: "TOTAL",
    });
  });
});
