import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { Request } from "../../../src/requesters/items/0-request";
import { Fetch } from "../../../src/requesters/items/1-fetch";
import { BUILD } from "../../../src/utils/misc-utils";

let databaseClient: DynamoDBClient;

beforeAll(() => {
  databaseClient = new DynamoDBClient({});
});

describe("Fetch", () => {
  test("should return an instance of Request", () => {
    const instance = new Fetch(databaseClient, "");
    expect(instance).toBeInstanceOf(Request);
  });

  test("should return an instance of Fetch", () => {
    const instance = new Fetch(databaseClient, "");

    expect(instance.consistentRead()).toBe(instance);
    expect(instance[BUILD]()).toEqual({
      TableName: "",
      ConsistentRead: true,
    });
  });

  test("should return an instance of Fetch", () => {
    const instance = new Fetch(databaseClient, "");

    expect(instance.select()).toBe(instance);
    expect(instance[BUILD]()).toEqual({
      TableName: "",
    });
  });

  test("should return an instance of Fetch", () => {
    const instance = new Fetch(databaseClient, "");

    expect(instance.select(undefined, "")).toBe(instance);
    expect(instance[BUILD]()).toEqual({
      TableName: "",
      _ProjectionExpressions: [""],
    });
  });

  test("should return an instance of Fetch", () => {
    const instance = new Fetch(databaseClient, "");

    expect(instance.select("id")).toBe(instance);
    expect(instance[BUILD]()).toEqual({
      TableName: "",
      _ProjectionExpressions: ["id"],
    });
  });
});
