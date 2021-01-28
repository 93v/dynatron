import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import nock from "nock";

import { TableRequest } from "../../../src/requesters/tables/0-table-request";
import { TableDelete } from "../../../src/requesters/tables/table-delete";
import { BUILD } from "../../../src/utils/misc-utils";

afterEach(() => {
  nock.abortPendingRequests();
  nock.cleanAll();
});

describe("Table Delete", () => {
  test("should return an instance of TableRequest", () => {
    const instance = new TableDelete(
      new DynamoDBClient({ region: "local" }),
      "tableName",
    );
    expect(instance).toBeInstanceOf(TableRequest);
  });

  test("should build correctly", () => {
    const instance = new TableDelete(
      new DynamoDBClient({ region: "local" }),
      "tableName",
    );
    expect(instance[BUILD]()).toEqual({ TableName: "tableName" });
  });

  test("should return a response", async () => {
    const scope = nock("https://localhost:8000")
      .post("/")
      .reply(200, { TableDescription: {} });

    const instance = new TableDelete(
      new DynamoDBClient({ region: "local" }),
      "tableName",
    );

    expect(await instance.$()).toEqual({});
    scope.persist(false);
  });

  test("should retry on retryable error", async () => {
    const scope = nock("https://localhost:8000")
      .persist(true)
      .post("/")
      .replyWithError("ECONN: Connection error");

    const instance = new TableDelete(
      new DynamoDBClient({ region: "local" }),
      "tableName",
    );

    try {
      await instance.$();
    } catch (error) {
      expect(error).toBeDefined();
    }
    scope.persist(false);
  });

  test("should fail on non-retryable error", async () => {
    const scope = nock("https://localhost:8000")
      .persist(true)
      .post("/")
      .replyWithError("Unknown");

    const instance = new TableDelete(
      new DynamoDBClient({ region: "local" }),
      "tableName",
    );

    try {
      await instance.$();
    } catch (error) {
      expect(error).toBeDefined();
    }
    scope.persist(false);
  });
});
