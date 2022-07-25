import nock from "nock";

import { Dynatron, DynatronClient } from "../../../src";
import { ItemRequest } from "../../../src/requesters/_core/items-request";
import { TransactGet } from "../../../src/requesters/transact/transact-get";
import { BUILD } from "../../../src/utils/misc-utils";

afterEach(() => {
  // nock.abortPendingRequests();
  // nock.cleanAll();
});

let databaseClient: DynatronClient;
let database: Dynatron;

beforeAll(() => {
  databaseClient = new DynatronClient({});
  database = new Dynatron(databaseClient);
});

describe("Item TransactGet", () => {
  test("should return an instance of ItemRequest", () => {
    const instance = new TransactGet(
      new DynatronClient({ region: "local" }),
      [],
    );
    expect(instance).toBeInstanceOf(ItemRequest);
  });

  test("should build correctly", () => {
    const instance = new TransactGet(
      new DynatronClient({ region: "local" }),
      [],
    );
    expect(instance).toBeInstanceOf(TransactGet);
    expect(instance[BUILD]()).toEqual({
      TableName: undefined,
      ReturnConsumedCapacity: "NONE",
    });
  });

  test("should handle no response correctly", async () => {
    const scope = nock("https://localhost:8000")
      .persist(true)
      .post("/")
      .reply(200, {});

    const instance = new TransactGet(new DynatronClient({ region: "local" }), [
      database.Items("tableName1").get({ id: "uuid1" }).select("value"),
    ]);
    expect(await instance.$()).toEqual({});
    expect(await instance.$()).toEqual({});
    scope.persist(false);
    nock.cleanAll();
  });

  test("should handle raw response flag correctly", async () => {
    const scope = nock("https://localhost:8000")
      .persist(true)
      .post("/")
      .reply(200, { Responses: [{ Item: { id: { S: "uuid" } } }] });

    const instance = new TransactGet(new DynatronClient({ region: "local" }), [
      database.Items("tableName1").get({ id: "uuid1" }).select("value"),
    ]);
    expect(await instance.$()).toEqual({ data: [{ id: "uuid" }] });
    expect(await instance.$()).toEqual({
      data: [{ id: "uuid" }],
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
      new DynatronClient({ region: "local" }),
      [],
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

    const instance = new TransactGet(
      new DynatronClient({ region: "local" }),
      [],
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
