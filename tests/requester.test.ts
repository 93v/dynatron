import { Requester } from "../src/requesters/0-requester";
import { BUILD } from "../src/utils/constants";

describe("Requester", () => {
  test("should be an instance of Requester", () => {
    const instance = new Requester();
    expect(instance).toBeInstanceOf(Requester);
  });

  test("method call should return itself", () => {
    const instance = new Requester();
    expect(instance.returnConsumedCapacity("INDEXES")).toBe(instance);
  });

  test("should build empty", () => {
    expect(new Requester()[BUILD]()).toMatchObject({});
  });

  test("should build with ReturnConsumedCapacity", () => {
    const instance = new Requester();
    instance.returnConsumedCapacity("INDEXES");
    expect(instance[BUILD]()).toMatchObject({
      ReturnConsumedCapacity: "INDEXES",
    });
  });

  test("should build with ReturnConsumedCapacity", () => {
    const instance = new Requester();
    instance.returnConsumedCapacity("NONE");
    expect(instance[BUILD]()).toMatchObject({
      ReturnConsumedCapacity: "NONE",
    });
  });

  test("should build with ReturnConsumedCapacity", () => {
    const instance = new Requester();
    instance.returnConsumedCapacity("TOTAL");
    expect(instance[BUILD]()).toMatchObject({
      ReturnConsumedCapacity: "TOTAL",
    });
  });
});
