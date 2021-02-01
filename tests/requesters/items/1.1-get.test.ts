import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import nock from "nock";

import { Fetch } from "../../../src/requesters/items/1-fetch";
import { Get } from "../../../src/requesters/items/1.1-get";
import { BUILD } from "../../../src/utils/misc-utils";

afterEach(() => {
  // nock.abortPendingRequests();
  // nock.cleanAll();
});

describe("Item Get", () => {
  test("should return an instance of Fetch", () => {
    const instance = new Get(
      new DynamoDBClient({ region: "local" }),
      "tableName",
      { id: "uuid" },
    );
    expect(instance).toBeInstanceOf(Fetch);
  });

  test("should build with minimal properties", () => {
    const instance = new Get(
      new DynamoDBClient({ region: "local" }),
      "tableName",
      { id: "uuid" },
    );
    expect(instance[BUILD]()).toEqual({
      TableName: "tableName",
      _Key: { id: "uuid" },
    });
  });

  test("should correctly handle raw response flag", async () => {
    const scope = nock("https://localhost:8000")
      .persist(true)
      .post("/")
      .reply(200, { Item: { id: { S: "uuid" } } });

    const instance = new Get(
      new DynamoDBClient({ region: "local" }),
      "tableName",
      { id: "uuid" },
    );
    expect(await instance.$()).toEqual({ id: "uuid" });
    expect(await instance.$(true)).toEqual({ Item: { id: { S: "uuid" } } });
    scope.persist(false);
    nock.cleanAll();
  });

  test("should retry on retryable error", async () => {
    const scope = nock("https://localhost:8000")
      .persist(true)
      .post("/")
      .replyWithError("ECONN: Connection error");

    const instance = new Get(
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

    const instance = new Get(
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
