import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import nock from "nock";

import { Dynatron, DynatronClient } from "../../../src";
import { Request } from "../../../src/requesters/_core/items-request";
import { TransactGet } from "../../../src/requesters/transact/transact-get";
import { BUILD } from "../../../src/utils/misc-utils";

afterEach(() => {
  // nock.abortPendingRequests();
  // nock.cleanAll();
});

let databaseClient: DynatronClient;
let database: Dynatron;

beforeAll(() => {
  databaseClient = new DynatronClient(
    Dynatron.optimizedClientConfigs({ region: "local" }),
  );
  database = new Dynatron(databaseClient);
});

describe("Item TransactGet", () => {
  test("should return an instance of Request", () => {
    const instance = new TransactGet(
      new DynamoDBClient({ region: "local" }),
      [],
    );
    expect(instance).toBeInstanceOf(Request);
  });

  test("should build correctly", () => {
    const instance = new TransactGet(
      new DynamoDBClient({ region: "local" }),
      [],
    );
    expect(instance.returnConsumedCapacity()).toBeInstanceOf(TransactGet);
    expect(instance[BUILD]()).toEqual({
      TableName: undefined,
      ReturnConsumedCapacity: "TOTAL",
    });
  });

  test("should handle no response correctly", async () => {
    const scope = nock("https://localhost:8000")
      .persist(true)
      .post("/")
      .reply(200, {});

    const instance = new TransactGet(new DynamoDBClient({ region: "local" }), [
      database.Items("tableName1").get({ id: "uuid1" }).select("value"),
    ]);
    expect(await instance.$()).toBeUndefined();
    expect(await instance.returnConsumedCapacity().$(true)).toEqual({
      ConsumedCapacity: undefined,
      Responses: undefined,
    });
    scope.persist(false);
    nock.cleanAll();
  });

  test("should handle raw response flag correctly", async () => {
    const scope = nock("https://localhost:8000")
      .persist(true)
      .post("/")
      .reply(200, { Responses: [{ Item: { id: { S: "uuid" } } }] });

    const instance = new TransactGet(new DynamoDBClient({ region: "local" }), [
      database.Items("tableName1").get({ id: "uuid1" }).select("value"),
    ]);
    expect(await instance.$()).toEqual([{ id: "uuid" }]);
    expect(await instance.returnConsumedCapacity().$(true)).toEqual({
      ConsumedCapacity: undefined,
      Responses: [{ Item: { id: { S: "uuid" } } }],
    });
    scope.persist(false);
    nock.cleanAll();
  });

  test("should retry on retryable error", async () => {
    const scope = nock("https://localhost:8000")
      .persist(true)
      .post("/")
      .replyWithError("ECONN: Connection error");

    const instance = new TransactGet(
      new DynamoDBClient({ region: "local" }),
      [],
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

    const instance = new TransactGet(
      new DynamoDBClient({ region: "local" }),
      [],
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
