import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { Request } from "../../../src/requesters/_core/items-request";
import { Fetch } from "../../../src/requesters/_core/items-fetch";
import { BUILD } from "../../../src/utils/misc-utils";

describe("Fetch", () => {
  test("should return an instance of Request", () => {
    const instance = new Fetch(new DynamoDBClient({}), "");
    expect(instance).toBeInstanceOf(Request);
  });

  test("should return an instance of Fetch and build to expected minimal object", () => {
    const instance = new Fetch(new DynamoDBClient({}), "");

    expect(instance.consistentRead().select()).toBe(instance);
    expect(instance[BUILD]()).toEqual({
      TableName: "",
      ConsistentRead: true,
    });
  });

  test("should handle undefined or empty string select options", () => {
    const instance = new Fetch(new DynamoDBClient({}), "");

    expect(instance.select(undefined, "")).toBe(instance);
    expect(instance[BUILD]()).toEqual({
      TableName: "",
      _ProjectionExpressions: [""],
    });
  });

  test("should correctly build with select", () => {
    const instance = new Fetch(new DynamoDBClient({}), "");

    expect(instance.select("id")).toBe(instance);
    expect(instance[BUILD]()).toEqual({
      TableName: "",
      _ProjectionExpressions: ["id"],
    });
  });
});
