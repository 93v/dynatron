import { DynatronClient, eq } from "../../../src";
import { Amend } from "../../../src/requesters/_core/items-amend";
import { Check } from "../../../src/requesters/_core/items-check";
import { BUILD } from "../../../src/utils/misc-utils";

describe("Check", () => {
  test("should return an instance of Amend", () => {
    const instance = new Check(new DynatronClient({}), "");
    expect(instance).toBeInstanceOf(Amend);
  });

  test("should return an instance of Amend", () => {
    const instance = new Check(new DynatronClient({}), "");

    expect(instance.returnValues()).toBe(instance);

    expect(instance[BUILD]()).toEqual({
      ReturnConsumedCapacity: "NONE",
      TableName: "",
      ReturnValues: "ALL_NEW",
    });
  });

  test("should handle a key if provided and build correctly", () => {
    const instance = new Check(new DynatronClient({}), "", { id: "uuid" });

    expect(instance[BUILD]()).toEqual({
      ReturnConsumedCapacity: "NONE",
      ReturnValues: "NONE",
      TableName: "",
      _Key: { id: "uuid" },
    });
  });

  test("should handle all possible ways to define an if condition", () => {
    const instance = new Check(new DynatronClient({}), "");

    expect(
      instance
        .if()
        .if(eq("id", "uuid"))
        .if(eq("value", 7))
        .if(eq("id2", "uuid2"), undefined, eq("value2", 3))
        .if([eq("id3", "uuid3"), eq("value3", 30)]),
    ).toBe(instance);
    expect(instance[BUILD]()).toEqual({
      ReturnConsumedCapacity: "NONE",
      ReturnValues: "NONE",
      TableName: "",
      _ConditionExpressions: [
        {
          attributePath: "id",
          kind: "=",
          value: "uuid",
        },
        {
          attributePath: "value",
          kind: "=",
          value: 7,
        },
        {
          attributePath: "id2",
          kind: "=",
          value: "uuid2",
        },
        {
          attributePath: "value2",
          kind: "=",
          value: 3,
        },
        {
          attributePath: "id3",
          kind: "=",
          value: "uuid3",
        },
        {
          attributePath: "value3",
          kind: "=",
          value: 30,
        },
      ],
    });
  });
});
