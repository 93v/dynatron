import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import nock from "nock";

import { beginsWith, equals } from "../../../src";
import { ListFetch } from "../../../src/requesters/items/1.3-list-fetch";
import { Query } from "../../../src/requesters/items/1.3.1-query";
import { BUILD } from "../../../src/utils/misc-utils";

afterEach(() => {
  // nock.abortPendingRequests();
  // nock.cleanAll();
});

describe("Query", () => {
  test("should return an instance of ListFetch", () => {
    const instance = new Query(
      new DynamoDBClient({ region: "local" }),
      "",
      equals("id", "uuid1"),
    );
    expect(instance).toBeInstanceOf(ListFetch);
  });

  test("should build correctly", () => {
    const instance = new Query(
      new DynamoDBClient({ region: "local" }),
      "",
      equals("id", "uuid1"),
    );

    expect(
      instance.having(equals("id2", "uuid2")).sort("ASC").sort("DSC")[BUILD](),
    ).toEqual({
      TableName: "",
      ScanIndexForward: false,
      _KeyConditionExpression: {
        kind: "AND",
        conditions: [
          { kind: "=", attributePath: "id", value: "uuid1" },
          { kind: "=", attributePath: "id2", value: "uuid2" },
        ],
      },
    });
  });

  test("should handle the raw response flag", async () => {
    const scope = nock("https://localhost:8000")
      .persist(true)
      .post("/")
      .reply(200, { Items: [{ id: { S: "uuid1" } }, { id: { S: "uuid2" } }] });

    const instance = new Query(
      new DynamoDBClient({ region: "local" }),
      "tableName",
      equals("id", "uuid1"),
    );
    expect(await instance.indexName("indexName").$()).toEqual([
      { id: "uuid1" },
      { id: "uuid2" },
    ]);
    expect(await instance.$(true)).toEqual({
      Items: [{ id: { S: "uuid1" } }, { id: { S: "uuid2" } }],
    });
    scope.persist(false);
    nock.cleanAll();
  });

  test("should return limited items", async () => {
    const scope = nock("https://localhost:8000")
      .persist(true)
      .post("/")
      .reply(200, { Items: [{ id: { S: "uuid1" } }, { id: { S: "uuid2" } }] });

    const instance = new Query(
      new DynamoDBClient({ region: "local" }),
      "tableName",
      equals("id", "uuid1"),
    );
    expect(await instance.limit(1).$()).toEqual([{ id: "uuid1" }]);
    scope.persist(false);
    nock.cleanAll();
  });

  test("should return an instance of Query", async () => {
    const scope = nock("https://localhost:8000")
      .persist(true)
      .post("/")
      .reply(200, {
        LastEvaluatedKey: { id: { S: "uuid1" } },
        Count: 1,
        ScannedCount: 1,
        ConsumedCapacity: { CapacityUnits: 1 },
        Items: [{ id: { S: "uuid1" } }, { id: { S: "uuid2" } }],
      });

    const instance = new Query(
      new DynamoDBClient({ region: "local" }),
      "tableName",
      equals("id", "uuid1"),
    );
    expect(await instance.limit(1).$(true, true)).toEqual({
      ConsumedCapacity: { CapacityUnits: 1 },
      Count: 1,
      Items: [{ id: { S: "uuid1" } }],
      LastEvaluatedKey: { id: { S: "uuid1" } },
      ScannedCount: 1,
    });
    scope.persist(false);
    nock.cleanAll();
  });

  test("should return an instance of Query", async () => {
    const scope = nock("https://localhost:8000")
      .persist(true)
      .post("/")
      .reply(200, {
        LastEvaluatedKey: { id: { S: "uuid1" } },
        Count: 1,
        ScannedCount: 1,
        ConsumedCapacity: { CapacityUnits: 1 },
        Items: [{ id: { S: "uuid1" } }, { id: { S: "uuid2" } }],
      });

    const instance = new Query(
      new DynamoDBClient({ region: "local" }),
      "tableName",
      equals("id", "uuid1"),
    );
    expect(
      await instance.limit(1).where(beginsWith("name", "A")).$(true, false),
    ).toEqual({
      ConsumedCapacity: {
        CapacityUnits: 1,
        GlobalSecondaryIndexes: undefined,
        LocalSecondaryIndexes: undefined,
        ReadCapacityUnits: undefined,
        Table: undefined,
        TableName: undefined,
        WriteCapacityUnits: undefined,
      },
      Count: 1,
      Items: [{ id: { S: "uuid1" } }],
      LastEvaluatedKey: {
        id: {
          S: "uuid1",
        },
      },
      ScannedCount: 1,
    });
    scope.persist(false);
    nock.cleanAll();
  });

  test("should retry on retryable error", async () => {
    const scope = nock("https://localhost:8000")
      .persist(true)
      .post("/")
      .replyWithError("ECONN: Connection error");

    const instance = new Query(
      new DynamoDBClient({ region: "local" }),
      "tableName",
      equals("id", "uuid1"),
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

    const instance = new Query(
      new DynamoDBClient({ region: "local" }),
      "tableName",
      equals("id", "uuid1"),
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
