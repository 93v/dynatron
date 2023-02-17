import nock from "nock";

import { DynatronClient } from "../../../src";
import { Fetch } from "../../../src/requesters/_core/items-fetch";
import { Get } from "../../../src/requesters/items/items-get";
import { BUILD } from "../../../src/utils/misc-utils";

afterEach(() => {
  // nock.abortPendingRequests();
  // nock.cleanAll();
});

describe("Item Get", () => {
  test("should return an instance of Fetch", () => {
    const instance = new Get(
      new DynatronClient({
        region: "local",
        endpoint: "http://127.0.0.1:8000",
      }),
      "tableName",
      { id: "uuid" },
    );
    expect(instance).toBeInstanceOf(Fetch);
  });

  test("should build with minimal properties", () => {
    const instance = new Get(
      new DynatronClient({
        region: "local",
        endpoint: "http://127.0.0.1:8000",
      }),
      "tableName",
      { id: "uuid" },
    );
    expect(instance[BUILD]()).toEqual({
      ReturnConsumedCapacity: "NONE",
      TableName: "tableName",
      _Key: { id: "uuid" },
    });
  });

  test("should correctly handle raw response flag", async () => {
    const scope = nock("http://127.0.0.1:8000")
      .persist(true)
      .post("/")
      .reply(200, { Item: { id: { S: "uuid" } } });

    const instance = new Get(
      new DynatronClient({
        region: "local",
        endpoint: "http://127.0.0.1:8000",
      }),
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
    const scope = nock("http://127.0.0.1:8000")
      .persist(true)
      .post("/")
      .replyWithError("ECONN: Connection error");

    const instance = new Get(
      new DynatronClient({
        region: "local",
        endpoint: "http://127.0.0.1:8000",
      }),
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
    const scope = nock("http://127.0.0.1:8000")
      .persist(true)
      .post("/")
      .replyWithError("Unknown");

    const instance = new Get(
      new DynatronClient({
        region: "local",
        endpoint: "http://127.0.0.1:8000",
      }),
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
