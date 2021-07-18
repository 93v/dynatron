import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import nock from "nock";

import { TableRequest } from "../../../src/requesters/_core/table-request";
import { TableUpdate } from "../../../src/requesters/tables/tables-update";

afterEach(() => {
  // nock.abortPendingRequests();
  // nock.cleanAll();
});

describe("Table Update", () => {
  test("should return an instance of TableRequest", () => {
    const instance = new TableUpdate(new DynamoDBClient({ region: "local" }), {
      TableName: "tableName",
    });
    expect(instance).toBeInstanceOf(TableRequest);
  });

  test("should return a response", async () => {
    const scope = nock("https://localhost:8000")
      .post("/")
      .reply(200, { TableDescription: {} });

    const instance = new TableUpdate(new DynamoDBClient({ region: "local" }), {
      TableName: "tableName",
    });

    expect(await instance.$()).toEqual({});
    scope.persist(false);
    nock.cleanAll();
  });

  test("should retry on retryable error", async () => {
    const scope = nock("https://localhost:8000")
      .persist(true)
      .post("/")
      .replyWithError("ECONN: Connection error");

    const instance = new TableUpdate(new DynamoDBClient({ region: "local" }), {
      TableName: "tableName",
    });

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

    const instance = new TableUpdate(new DynamoDBClient({ region: "local" }), {
      TableName: "tableName",
    });

    try {
      await instance.$();
    } catch (error) {
      expect(error).toBeDefined();
    }
    scope.persist(false);
    nock.cleanAll();
  });
});
