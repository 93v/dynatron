import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { and, eq, or } from "../../../src/condition-expression-builders";

import { Fetch } from "../../../src/requesters/items/1-fetch";
import { ListFetch } from "../../../src/requesters/items/1.3-list-fetch";
import { BUILD } from "../../../src/utils/misc-utils";

let databaseClient: DynamoDBClient;

beforeAll(() => {
  databaseClient = new DynamoDBClient({});
});

describe("ListFetch", () => {
  test("should return an instance of Fetch", () => {
    const instance = new ListFetch(databaseClient, "");
    expect(instance).toBeInstanceOf(Fetch);
  });

  test("should return an instance of ListFetch", () => {
    const instance = new ListFetch(databaseClient, "");

    expect(instance.indexName("")).toBe(instance);
    expect(instance[BUILD]()).toEqual({
      TableName: "",
    });

    expect(instance.indexName("index")).toBe(instance);
    expect(instance[BUILD]()).toEqual({
      TableName: "",
      IndexName: "index",
    });
  });

  test("should return an instance of ListFetch", () => {
    const instance = new ListFetch(databaseClient, "");

    expect(instance.limit(2)).toBe(instance);
    expect(instance[BUILD]()).toEqual({
      TableName: "",
      Limit: 2,
    });
  });

  test("should return an instance of ListFetch", () => {
    const instance = new ListFetch(databaseClient, "");

    expect(instance.start()).toBe(instance);
    expect(instance[BUILD]()).toEqual({
      TableName: "",
    });

    expect(instance.start({ id: "id" })).toBe(instance);
    expect(instance[BUILD]()).toEqual({
      TableName: "",
      _ExclusiveStartKey: { id: "id" },
    });
  });

  test("should return an instance of ListFetch", () => {
    const instance = new ListFetch(databaseClient, "");

    expect(instance.select("id")).toBe(instance);
    expect(instance[BUILD]()).toEqual({
      TableName: "",
      _ProjectionExpressions: ["id"],
    });
  });

  test("should return an instance of ListFetch", () => {
    const instance = new ListFetch(databaseClient, "");

    expect(instance.where(eq("id", "uuid"))).toBe(instance);
    expect(instance[BUILD]()).toEqual({
      TableName: "",
      _FilterExpressions: [
        {
          kind: "=",
          attributePath: "id",
          value: "uuid",
        },
      ],
    });
  });
  test("should return an instance of ListFetch", () => {
    const instance = new ListFetch(databaseClient, "");

    expect(instance.where(and([]))).toBe(instance);
    expect(instance[BUILD]()).toEqual({
      TableName: "",
    });
  });
  test("should return an instance of ListFetch", () => {
    const instance = new ListFetch(databaseClient, "");

    expect(instance.where(and([]), undefined, or(eq("id", "uuid")))).toBe(
      instance,
    );
    expect(instance[BUILD]()).toEqual({
      TableName: "",
      _FilterExpressions: [
        {
          kind: "AND",
          conditions: [],
        },
        {
          kind: "OR",
          conditions: [
            {
              kind: "=",
              attributePath: "id",
              value: "uuid",
            },
          ],
        },
      ],
    });
  });
  test("should return an instance of ListFetch", () => {
    const instance = new ListFetch(databaseClient, "");

    expect(instance.where([and([]), or(eq("id", "uuid"))])).toBe(instance);
    expect(instance[BUILD]()).toEqual({
      TableName: "",
      _FilterExpressions: [
        { kind: "AND", conditions: [] },
        {
          kind: "OR",
          conditions: [
            {
              kind: "=",
              attributePath: "id",
              value: "uuid",
            },
          ],
        },
      ],
    });
  });
});
