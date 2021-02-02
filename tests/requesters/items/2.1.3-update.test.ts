import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import nock from "nock";

import { Check } from "../../../src/requesters/items/2.1-check";
import { Update } from "../../../src/requesters/items/2.1.3-update";
import { BUILD } from "../../../src/utils/misc-utils";

afterEach(() => {
  // nock.abortPendingRequests();
  // nock.cleanAll();
});

describe("Item Update", () => {
  test("should return an instance of Check", () => {
    const instance = new Update(
      new DynamoDBClient({ region: "local" }),
      "tableName",
      { id: "uuid" },
    );
    expect(instance).toBeInstanceOf(Check);
  });

  test("should correctly build all update options", () => {
    const instance = new Update(
      new DynamoDBClient({ region: "local" }),
      "tableName",
      { id: "uuid" },
    );
    expect(
      instance
        .assign({ value: 7, notDefined: undefined })
        .increment("value1", 7)
        .increment("value2", 7, false)
        .decrement("value3", 7)
        .decrement("value4", 7, false)
        .add("value5", new Set([7]))
        .append("value6", [7])
        .prepend("value7", [7])
        .delete("value8", new Set([7]))
        .drop("value9"),
    ).toBeInstanceOf(Update);
    expect(instance[BUILD]()).toEqual({
      TableName: "tableName",
      _Key: { id: "uuid" },
      _UpdateExpressions: [
        {
          attributePath: "value",
          kind: "set",
          value: 7,
          ifDoesNotExist: false,
        },
        { attributePath: "value1", kind: "add", value: 7 },
        { attributePath: "value2", kind: "increment", value: 7 },
        { attributePath: "value3", kind: "add", value: -7 },
        { attributePath: "value4", kind: "increment", value: -7 },
        { attributePath: "value5", kind: "add", value: new Set([7]) },
        { attributePath: "value6", kind: "append", value: [7] },
        { attributePath: "value7", kind: "prepend", value: [7] },
        { attributePath: "value8", kind: "delete", value: new Set([7]) },
        { attributePath: "value9", kind: "remove" },
      ],
    });
  });

  test("should correctly handle raw response flag", async () => {
    const scope = nock("https://localhost:8000")
      .persist(true)
      .post("/")
      .reply(200, { Attributes: { id: { S: "uuid" } } });

    const instance = new Update(
      new DynamoDBClient({ region: "local" }),
      "tableName",
      { id: "uuid" },
    );
    expect(await instance.$()).toEqual({ id: "uuid" });
    expect(await instance.$(true)).toEqual({
      Attributes: { id: { S: "uuid" } },
    });
    scope.persist(false);
    nock.cleanAll();
  });

  test("should retry on retryable error", async () => {
    const scope = nock("https://localhost:8000")
      .persist(true)
      .post("/")
      .replyWithError("ECONN: Connection error");

    const instance = new Update(
      new DynamoDBClient({ region: "local" }),
      "tableName",
      { id: "uuid" },
    );
    try {
      await instance.$();
    } catch (error) {
      expect(error).toBeDefined();
    }
    scope.persist(false);
    nock.cleanAll();
  });

  test("should fail on non-retryable error", async () => {
    const scope = nock("https://localhost:8000")
      .persist(true)
      .post("/")
      .replyWithError("Unknown");

    const instance = new Update(
      new DynamoDBClient({ region: "local" }),
      "tableName",
      { id: "uuid" },
    );
    try {
      await instance.$();
    } catch (error) {
      expect(error).toBeDefined();
    }
    scope.persist(false);
    nock.cleanAll();
  });
});
