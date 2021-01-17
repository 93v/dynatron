import { Requester } from "../src/requesters/0-requester";
import { Mutator } from "../src/requesters/2-mutator";
import { BUILD } from "../src/utils/constants";

describe("Mutator", () => {
  test("should be an instance of Requester", () => {
    const instance = new Mutator();
    expect(instance).toBeInstanceOf(Requester);
  });

  test("should be an instance of Mutator", () => {
    const instance = new Mutator();
    expect(instance).toBeInstanceOf(Mutator);
  });

  test("method call should return itself", () => {
    const instance = new Mutator();
    expect(instance.returnItemCollectionMetrics()).toBe(instance);
  });

  test("should build with ReturnItemCollectionMetrics", () => {
    const instance = new Mutator();
    instance.returnItemCollectionMetrics();

    expect(instance[BUILD]()).toMatchObject({
      ReturnItemCollectionMetrics: "SIZE",
    });
  });

  test("should build with ReturnItemCollectionMetrics", () => {
    const instance = new Mutator();
    instance.returnItemCollectionMetrics("SIZE");

    expect(instance[BUILD]()).toMatchObject({
      ReturnItemCollectionMetrics: "SIZE",
    });
  });

  test("should build with ReturnItemCollectionMetrics", () => {
    const instance = new Mutator();
    instance.returnItemCollectionMetrics("NONE");

    expect(instance[BUILD]()).toMatchObject({
      ReturnItemCollectionMetrics: "NONE",
    });
  });
});
