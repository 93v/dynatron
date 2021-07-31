import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import nock from "nock";

import { Check } from "../../../src/requesters/_core/items-check";
import { Put } from "../../../src/requesters/items/items-put";
import { BUILD } from "../../../src/utils/misc-utils";

afterEach(() => {
  // nock.abortPendingRequests();
  // nock.cleanAll();
});

describe("Item Put", () => {
  test("should return an instance of Check", () => {
    const instance = new Put(
      new DynamoDBClient({ region: "local" }),
      "tableName",
      { id: "uuid" },
    );
    expect(instance).toBeInstanceOf(Check);
  });

  test("should build with minimal properties", () => {
    const instance = new Put(
      new DynamoDBClient({ region: "local" }),
      "tableName",
      { id: "uuid" },
    );

    expect(instance[BUILD]()).toEqual({
      ReturnConsumedCapacity: "INDEXES",
      ReturnValues: "NONE",
      TableName: "tableName",
      _Item: { id: "uuid" },
    });
  });

  test("should correctly handle raw response flag", async () => {
    const scope = nock("https://localhost:8000")
      .persist(true)
      .post("/")
      .reply(200, { Item: { id: { S: "uuid" } } });

    const instance = new Put(
      new DynamoDBClient({ region: "local" }),
      "tableName",
      { id: "uuid" },
    );
    expect(await instance.$()).toEqual({
      data: { id: "uuid" },
    });
    scope.persist(false);
    nock.cleanAll();
  });

  test("should retry on retryable error", async () => {
    const scope = nock("https://localhost:8000")
      .persist(true)
      .post("/")
      .replyWithError("ECONN: Connection error");

    const instance = new Put(
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

    const instance = new Put(
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
