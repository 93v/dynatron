import { DynatronClient } from "../../../src";
import { Fetch } from "../../../src/requesters/_core/items-fetch";
import { ItemRequest } from "../../../src/requesters/_core/items-request";
import { BUILD } from "../../../src/utils/misc-utils";

describe("Fetch", () => {
  test("should return an instance of ItemRequest", () => {
    const instance = new Fetch(new DynatronClient({}), "");
    expect(instance).toBeInstanceOf(ItemRequest);
  });

  test("should return an instance of Fetch and build to expected minimal object", () => {
    const instance = new Fetch(new DynatronClient({}), "");

    expect(instance.consistentRead().select()).toBe(instance);
    expect(instance[BUILD]()).toEqual({
      ReturnConsumedCapacity: "NONE",
      TableName: "",
      ConsistentRead: true,
    });
  });

  test("should handle undefined or empty string select options", () => {
    const instance = new Fetch(new DynatronClient({}), "");

    expect(instance.select(undefined, "")).toBe(instance);
    expect(instance[BUILD]()).toEqual({
      ReturnConsumedCapacity: "NONE",
      TableName: "",
    });
  });

  test("should correctly build with select", () => {
    const instance = new Fetch(new DynatronClient({}), "");

    expect(instance.select("id")).toBe(instance);
    expect(instance[BUILD]()).toEqual({
      ReturnConsumedCapacity: "NONE",
      TableName: "",
      _ProjectionExpressions: ["id"],
    });
  });
});
