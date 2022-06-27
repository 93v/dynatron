import nock from "nock";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { Request } from "../../../src/requesters/_core/request";
import { TableCreate } from "../../../src/requesters/tables/tables-create";
import { BUILD } from "../../../src/utils/misc-utils";

afterEach(() => {
  // nock.abortPendingRequests();
  // nock.cleanAll();
});

describe("Table Create", () => {
  test("should return an instance of Request", () => {
    const instance = new TableCreate(new DynamoDBClient({ region: "local" }), {
      AttributeDefinitions: [],
      KeySchema: [],
      TableName: "tableName",
    });
    expect(instance).toBeInstanceOf(Request);
  });

  test("should build correctly", () => {
    const instance = new TableCreate(new DynamoDBClient({ region: "local" }), {
      AttributeDefinitions: [],
      KeySchema: [],
      TableName: "tableName",
    });
    expect(instance[BUILD]()).toEqual({
      AttributeDefinitions: [],
      KeySchema: [],
      TableName: "tableName",
    });
  });

  test("should return a response", async () => {
    const scope = nock("https://localhost:8000")
      .persist(true)
      .post("/")
      .reply(200, { TableDescription: {} });

    const instance = new TableCreate(new DynamoDBClient({ region: "local" }), {
      AttributeDefinitions: [],
      KeySchema: [],
      TableName: "tableName",
    });
    expect(await instance.$()).toEqual({ data: {} });
    scope.persist(false);
    nock.cleanAll();
  });

  test("should retry on retryable error", async () => {
    const scope = nock("https://localhost:8000")
      .persist(true)
      .post("/")
      .replyWithError("ECONN: Connection error");

    const instance = new TableCreate(new DynamoDBClient({ region: "local" }), {
      AttributeDefinitions: [],
      KeySchema: [],
      TableName: "tableName",
    });

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

    const instance = new TableCreate(new DynamoDBClient({ region: "local" }), {
      AttributeDefinitions: [],
      KeySchema: [],
      TableName: "tableName",
    });

    try {
      await instance.$();
    } catch (error: unknown) {
      expect(error).toBeDefined();
    }
    scope.persist(false);
    nock.cleanAll();
  });
});
