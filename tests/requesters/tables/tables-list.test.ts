import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import nock from "nock";

import { TableRequest } from "../../../src/requesters/_core/table-request";
import { TableList } from "../../../src/requesters/tables/tables-list";
import { BUILD } from "../../../src/utils/misc-utils";

afterEach(() => {
  // nock.abortPendingRequests();
  // nock.cleanAll();
});

describe("Table List", () => {
  test("should return an instance of TableRequest", () => {
    const instance = new TableList(new DynamoDBClient({ region: "local" }));
    expect(instance).toBeInstanceOf(TableRequest);
  });

  test("should throw on negative limit", () => {
    const instance = new TableList(new DynamoDBClient({ region: "local" }));
    expect(() => instance.limit(-1)).toThrow();
  });

  test("should correctly build", () => {
    const instance = new TableList(new DynamoDBClient({ region: "local" }));
    instance.limit(1).start().start("startTableName");
    expect(instance).toBeInstanceOf(TableList);
    expect(instance[BUILD]()).toEqual({
      Limit: 1,
      ExclusiveStartTableName: "startTableName",
    });
  });

  test("should return a list", async () => {
    const scope = nock("https://localhost:8000").post("/").reply(200, {
      LastEvaluatedTableName: "hello",
    });
    nock("https://localhost:8000")
      .post("/")
      .reply(200, {
        TableNames: ["table1", "table2"],
        LastEvaluatedTableName: "hello",
      })
      .post("/")
      .reply(200, { TableNames: ["table3", "table4"] })
      .post("/")
      .reply(200, { TableNames: ["table3", "table4"] });

    const instance = new TableList(new DynamoDBClient({ region: "local" }));

    expect(await instance.limit(3).$()).toEqual(["table1", "table2", "table3"]);
    scope.persist(false);
    nock.cleanAll();
  });

  test("should retry on retryable error", async () => {
    const scope = nock("https://localhost:8000")
      .persist(true)
      .post("/")
      .replyWithError("ECONN: Connection error");

    const instance = new TableList(new DynamoDBClient({ region: "local" }));

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

    const instance = new TableList(new DynamoDBClient({ region: "local" }));

    try {
      await instance.$();
    } catch (error) {
      expect(error).toBeDefined();
    }
    scope.persist(false);
    nock.cleanAll();
  });
});
