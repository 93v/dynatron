import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { Fetch } from "../../../src/requesters/_core/items-fetch";
import { ItemRequest } from "../../../src/requesters/_core/items-request";
import { BUILD } from "../../../src/utils/misc-utils";

describe("Fetch", () => {
  test("should return an instance of ItemRequest", () => {
    const instance = new Fetch(new DynamoDBClient({}), "");
    expect(instance).toBeInstanceOf(ItemRequest);
  });

  test("should return an instance of Fetch and build to expected minimal object", () => {
    const instance = new Fetch(new DynamoDBClient({}), "");

    expect(instance.consistentRead().select()).toBe(instance);
    expect(instance[BUILD]()).toEqual({
      ReturnConsumedCapacity: "INDEXES",
      TableName: "",
      ConsistentRead: true,
    });
  });

  test("should handle undefined or empty string select options", () => {
    const instance = new Fetch(new DynamoDBClient({}), "");

    expect(instance.select(undefined, "")).toBe(instance);
    expect(instance[BUILD]()).toEqual({
      ReturnConsumedCapacity: "INDEXES",
      TableName: "",
    });
  });

  test("should correctly build with select", () => {
    const instance = new Fetch(new DynamoDBClient({}), "");

    expect(instance.select("id")).toBe(instance);
    expect(instance[BUILD]()).toEqual({
      ReturnConsumedCapacity: "INDEXES",
      TableName: "",
      _ProjectionExpressions: ["id"],
    });
  });
});
