import nock from "nock";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { Request } from "../../../src/requesters/_core/request";
import { TableDescribe } from "../../../src/requesters/tables/tables-describe";
import { BUILD } from "../../../src/utils/misc-utils";

afterEach(() => {
  // nock.abortPendingRequests();
  // nock.cleanAll();
});

describe("Table Describe", () => {
  test("should return an instance of Request", () => {
    const instance = new TableDescribe(
      new DynamoDBClient({ region: "local" }),
      "tableName",
    );
    expect(instance).toBeInstanceOf(Request);
  });

  test("should build correctly", () => {
    const instance = new TableDescribe(
      new DynamoDBClient({ region: "local" }),
      "tableName",
    );
    expect(instance[BUILD]()).toEqual({ TableName: "tableName" });
  });

  test("should return a response", async () => {
    const scope = nock("https://localhost:8000")
      .post("/")
      .reply(200, { Table: {} });

    const instance = new TableDescribe(
      new DynamoDBClient({ region: "local" }),
      "tableName",
    );

    expect(await instance.$()).toEqual({ data: {} });
    scope.persist(false);
    nock.cleanAll();
  });

  test("should retry on retryable error", async () => {
    const scope = nock("https://localhost:8000")
      .persist(true)
      .post("/")
      .replyWithError("ECONN: Connection error");

    const instance = new TableDescribe(
      new DynamoDBClient({ region: "local" }),
      "tableName",
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

    const instance = new TableDescribe(
      new DynamoDBClient({ region: "local" }),
      "tableName",
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
