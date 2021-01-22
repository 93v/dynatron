import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { eq } from "../../../src/condition-expression-builders";

import { Amend } from "../../../src/requesters/items/2-amend";
import { Check } from "../../../src/requesters/items/2.1-check";
import { BUILD } from "../../../src/utils/misc-utils";

let databaseClient: DynamoDBClient;

beforeAll(() => {
  databaseClient = new DynamoDBClient({});
});

describe("Check", () => {
  test("should return an instance of Amend", () => {
    const instance = new Check(databaseClient, "");
    expect(instance).toBeInstanceOf(Amend);
  });

  test("should return an instance of Amend", () => {
    const instance = new Check(databaseClient, "");

    expect(instance.returnValues()).toBe(instance);
    expect(instance[BUILD]()).toEqual({
      TableName: "",
      ReturnValues: "ALL_OLD",
    });
  });

  test("should return an instance of Amend", () => {
    const instance = new Check(databaseClient, "", { id: "uuid" });

    expect(instance[BUILD]()).toEqual({
      TableName: "",
      _Key: { id: "uuid" },
    });
  });

  test("should return an instance of Amend", () => {
    const instance = new Check(databaseClient, "");

    expect(instance.if()).toBe(instance);
    expect(instance[BUILD]()).toEqual({
      TableName: "",
    });
  });

  test("should return an instance of Amend", () => {
    const instance = new Check(databaseClient, "");

    expect(instance.if(eq("id", "uuid"))).toBe(instance);
    expect(instance[BUILD]()).toEqual({
      TableName: "",
      _ConditionExpressions: [
        {
          attributePath: "id",
          kind: "=",
          value: "uuid",
        },
      ],
    });
  });

  test("should return an instance of Amend", () => {
    const instance = new Check(databaseClient, "");

    expect(instance.if(eq("id", "uuid")).if(eq("value", 7))).toBe(instance);
    expect(instance[BUILD]()).toEqual({
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
      ],
    });
  });

  test("should return an instance of Amend", () => {
    const instance = new Check(databaseClient, "");

    expect(instance.if(eq("id", "uuid"), undefined, eq("value", 3))).toBe(
      instance,
    );
    expect(instance[BUILD]()).toEqual({
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
          value: 3,
        },
      ],
    });
  });

  test("should return an instance of Amend", () => {
    const instance = new Check(databaseClient, "");

    expect(instance.if([eq("id", "uuid"), eq("value", 3)])).toBe(instance);
    expect(instance[BUILD]()).toEqual({
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
          value: 3,
        },
      ],
    });
  });
});
