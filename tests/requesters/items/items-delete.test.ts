import nock from "nock";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { Check } from "../../../src/requesters/_core/items-check";
import { Delete } from "../../../src/requesters/items/items-delete";
import { BUILD } from "../../../src/utils/misc-utils";

afterEach(() => {
  // nock.abortPendingRequests();
  // nock.cleanAll();
});

describe("Item Delete", () => {
  test("should return an instance of Check", () => {
    const instance = new Delete(
      new DynamoDBClient({ region: "local" }),
      "tableName",
      { id: "uuid" },
    );
    expect(instance).toBeInstanceOf(Check);
  });

  test("should build with minimal properties", () => {
    const instance = new Delete(
      new DynamoDBClient({ region: "local" }),
      "tableName",
      { id: "uuid" },
    );
    expect(instance[BUILD]()).toEqual({
      ReturnConsumedCapacity: "INDEXES",
      ReturnValues: "NONE",
      TableName: "tableName",
      _Key: { id: "uuid" },
    });
  });

  test("should correctly handle raw response flag", async () => {
    const scope = nock("https://localhost:8000")
      .persist(true)
      .post("/")
      .reply(200, { Attributes: { id: { S: "uuid" } } });

    const instance = new Delete(
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

    const instance = new Delete(
      new DynamoDBClient({ region: "local" }),
      "tableName",
      { id: "uuid" },
    );
    try {
      await instance.$();
    } catch (error: unknown) {
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

    const instance = new Delete(
      new DynamoDBClient({ region: "local" }),
      "tableName",
      { id: "uuid" },
    );
    try {
      await instance.$();
    } catch (error: unknown) {
      expect(error).toBeDefined();
    }
    scope.persist(false);
    nock.cleanAll();
  });
});
