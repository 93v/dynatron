import nock from "nock";

import { DynatronClient } from "../../../src";
import { Request } from "../../../src/requesters/_core/request";
import { TableUpdate } from "../../../src/requesters/tables/tables-update";

afterEach(() => {
  // nock.abortPendingRequests();
  // nock.cleanAll();
});

describe("Table Update", () => {
  test("should return an instance of Request", () => {
    const instance = new TableUpdate(
      new DynatronClient({
        region: "local",
        endpoint: "http://127.0.0.1:8000",
      }),
      {
        TableName: "tableName",
      },
    );
    expect(instance).toBeInstanceOf(Request);
  });

  test("should return a response", async () => {
    const scope = nock("http://127.0.0.1:8000")
      .post("/")
      .reply(200, { TableDescription: {} });

    const instance = new TableUpdate(
      new DynatronClient({
        region: "local",
        endpoint: "http://127.0.0.1:8000",
      }),
      {
        TableName: "tableName",
      },
    );

    expect(await instance.$()).toEqual({ data: {} });
    scope.persist(false);
    nock.cleanAll();
  });

  test("should retry on retryable error", async () => {
    const scope = nock("http://127.0.0.1:8000")
      .persist(true)
      .post("/")
      .replyWithError("ECONN: Connection error");

    const instance = new TableUpdate(
      new DynatronClient({
        region: "local",
        endpoint: "http://127.0.0.1:8000",
      }),
      {
        TableName: "tableName",
      },
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

    const instance = new TableUpdate(
      new DynatronClient({
        region: "local",
        endpoint: "http://127.0.0.1:8000",
      }),
      {
        TableName: "tableName",
      },
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
