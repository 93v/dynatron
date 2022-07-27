import { DynatronClient } from "../../../src/dynatron";
import { Amend } from "../../../src/requesters/_core/items-amend";
import { ItemRequest } from "../../../src/requesters/_core/items-request";
import { BUILD } from "../../../src/utils/misc-utils";

describe("Amend", () => {
  test("should return an instance of ItemRequest", () => {
    const instance = new Amend(new DynatronClient({}), "");
    expect(instance).toBeInstanceOf(ItemRequest);
  });

  test("should return an instance of Amend and correctly build", () => {
    const instance = new Amend(new DynatronClient({}), "");

    expect(instance.returnItemCollectionMetrics()).toBe(instance);
    expect(instance[BUILD]()).toEqual({
      ReturnConsumedCapacity: "NONE",
      TableName: "",
      ReturnItemCollectionMetrics: "SIZE",
    });
  });

  test("should return an instance of Amend and correctly build with default consumed capacity", () => {
    const instance = new Amend(new DynatronClient({ returnMetrics: true }), "");

    expect(instance.returnItemCollectionMetrics()).toBe(instance);
    expect(instance[BUILD]()).toEqual({
      ReturnConsumedCapacity: "INDEXES",
      TableName: "",
      ReturnItemCollectionMetrics: "SIZE",
    });
  });
});
