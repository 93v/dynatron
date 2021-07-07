import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { and, eq, or } from "../../../src";
import { Fetch } from "../../../src/requesters/_core/items-fetch";
import { ListFetch } from "../../../src/requesters/_core/items-list-fetch";
import { BUILD } from "../../../src/utils/misc-utils";

describe("ListFetch", () => {
  test("should return an instance of Fetch", () => {
    const instance = new ListFetch(new DynamoDBClient({}), "");
    expect(instance).toBeInstanceOf(Fetch);
  });

  test("should build with index, limit and start provided", () => {
    const instance = new ListFetch(new DynamoDBClient({}), "");

    expect(
      instance.indexName("index").limit(2).start().start({ id: "id" }),
    ).toBe(instance);
    expect(instance[BUILD]()).toEqual({
      TableName: "",
      IndexName: "index",
      Limit: 2,
      _ExclusiveStartKey: { id: "id" },
    });
  });

  test("should build with filter conditions", () => {
    const instance = new ListFetch(new DynamoDBClient({}), "");

    expect(
      instance
        .where(and([]), undefined, or(eq("id", "uuid")))
        .where(and([]))
        .where(eq("id", "uuid"))
        .where(eq("value", 7))
        .where([and([]), or(eq("id", "uuid"))]),
    ).toBe(instance);
    expect(instance[BUILD]()).toEqual({
      TableName: "",
      _FilterExpressions: [
        { conditions: [], kind: "AND" },
        {
          conditions: [{ kind: "=", attributePath: "id", value: "uuid" }],
          kind: "OR",
        },
        { kind: "=", attributePath: "id", value: "uuid" },
        { kind: "=", attributePath: "value", value: 7 },
        { conditions: [], kind: "AND" },
        {
          conditions: [{ kind: "=", attributePath: "id", value: "uuid" }],
          kind: "OR",
        },
      ],
    });
  });
});
