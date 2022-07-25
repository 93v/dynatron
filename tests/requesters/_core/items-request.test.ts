import { DynatronClient } from "../../../src";
import { ItemRequest } from "../../../src/requesters/_core/items-request";
import { BUILD } from "../../../src/utils/misc-utils";

describe("ItemRequest", () => {
  test("should default to 1 on negative relax ratio", () => {
    const instance = new ItemRequest(new DynatronClient({}), "");

    expect(instance.relaxLatencies(-1)).toHaveProperty("patienceRatio", 1);
  });

  test("should build to an expected object", () => {
    const instance = new ItemRequest(new DynatronClient({}), "");

    expect(instance.relaxLatencies()).toBe(instance);
    expect(instance[BUILD]()).toEqual({
      TableName: "",
      ReturnConsumedCapacity: "NONE",
    });
  });
});
