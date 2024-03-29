import nock from "nock";

import { beginsWith, DynatronClient } from "../../../src";
import { ListFetch } from "../../../src/requesters/_core/items-list-fetch";
import { Scan } from "../../../src/requesters/items/items-scan";
import { BUILD } from "../../../src/utils/misc-utils";

afterEach(() => {
  // nock.abortPendingRequests();
  // nock.cleanAll();
});

describe("Scan", () => {
  test("should return an instance of ListFetch", () => {
    const instance = new Scan(
      new DynatronClient({
        region: "local",
        endpoint: "http://127.0.0.1:8000",
      }),
      "tableName",
    );
    expect(instance).toBeInstanceOf(ListFetch);
  });

  test("should build correctly", () => {
    const instance = new Scan(
      new DynatronClient({
        region: "local",
        endpoint: "http://127.0.0.1:8000",
      }),
      "tableName",
    );
    instance.totalSegments();
    expect(instance[BUILD]()).toEqual({
      ReturnConsumedCapacity: "NONE",
      TableName: "tableName",
      TotalSegments: 10,
    });

    instance.totalSegments(100);
    expect(instance[BUILD]()).toEqual({
      ReturnConsumedCapacity: "NONE",
      TableName: "tableName",
      TotalSegments: 100,
    });
  });

  test("should return an instance of Scan", () => {
    const instance = new Scan(
      new DynatronClient({
        region: "local",
        endpoint: "http://127.0.0.1:8000",
      }),
      "tableName",
    );
    instance.segment(100);
    expect(instance[BUILD]()).toEqual({
      ReturnConsumedCapacity: "NONE",
      Segment: 100,
      TableName: "tableName",
      TotalSegments: 10,
    });
  });

  test("should return an instance of Scan", () => {
    const instance = new Scan(
      new DynatronClient({
        region: "local",
        endpoint: "http://127.0.0.1:8000",
      }),
      "tableName",
    );
    instance.disableSegments();
    expect(instance[BUILD]()).toEqual({
      ReturnConsumedCapacity: "NONE",
      TableName: "tableName",
    });
  });

  test("should return an instance of Scan", async () => {
    const scope = nock("http://127.0.0.1:8000")
      .persist(true)
      .post("/")
      .reply(200, {});

    const instance = new Scan(
      new DynatronClient({
        region: "local",
        endpoint: "http://127.0.0.1:8000",
      }),
      "tableName",
    );
    expect(await instance.$(true)).toEqual({
      Count: 0,
      ScannedCount: 0,
      data: [],
    });
    scope.persist(false);
    nock.cleanAll();
  });

  test("should return an instance of Scan", async () => {
    const scope = nock("http://127.0.0.1:8000")
      .persist(true)
      .post("/")
      .reply(200, {
        Items: [{ id: { S: "uuid1" } }, { id: { S: "uuid2" } }],
      });

    const instance = new Scan(
      new DynatronClient({
        region: "local",
        endpoint: "http://127.0.0.1:8000",
      }),
      "tableName",
    );
    instance.totalSegments(1);
    expect(await instance.$(true)).toEqual({
      Count: 0,
      ScannedCount: 0,
      data: [{ id: "uuid1" }, { id: "uuid2" }],
    });
    scope.persist(false);
    nock.cleanAll();
  });

  test("should return an instance of Scan", async () => {
    const scope = nock("http://127.0.0.1:8000")
      .persist(true)
      .post("/")
      .reply(200, {
        Items: [{ id: { S: "uuid1" } }, { id: { S: "uuid2" } }],
      });
    const instance = new Scan(
      new DynatronClient({
        region: "local",
        endpoint: "http://127.0.0.1:8000",
        returnMetrics: true,
      }),
      "tableName",
    );
    instance.totalSegments(1);
    expect(await instance.limit(1).where(beginsWith("name", "A")).$()).toEqual({
      data: [{ id: "uuid1" }],
      Count: 1,
      ScannedCount: 0,
    });
    scope.persist(false);
    nock.cleanAll();
  });

  test("should return an instance of Scan", async () => {
    const scope = nock("http://127.0.0.1:8000")
      .persist(true)
      .post("/")
      .reply(200, {
        LastEvaluatedKey: { id: { S: "uuid1" } },
        Items: [{ id: { S: "uuid1" } }, { id: { S: "uuid2" } }],
      });

    const instance = new Scan(
      new DynatronClient({
        region: "local",
        endpoint: "http://127.0.0.1:8000",
        returnMetrics: true,
      }),
      "tableName",
    );
    instance.totalSegments(1);
    expect(await instance.limit(1).$(true)).toEqual({
      data: [{ id: "uuid1" }],
      Count: 1,
      LastEvaluatedKey: { id: "uuid1" },
      ScannedCount: 0,
    });
    scope.persist(false);
    nock.cleanAll();
  });

  test("should return an instance of Scan", async () => {
    const scope = nock("http://127.0.0.1:8000")
      .persist(true)
      .post("/")
      .reply(200, {
        LastEvaluatedKey: { id: { S: "uuid1" } },
        Items: [{ id: { S: "uuid1" } }, { id: { S: "uuid2" } }],
      });

    const instance = new Scan(
      new DynatronClient({
        region: "local",
        endpoint: "http://127.0.0.1:8000",
        returnMetrics: true,
      }),
      "tableName",
    );
    instance.totalSegments(1);
    expect(await instance.limit(1).$()).toEqual({
      data: [{ id: "uuid1" }],
      Count: 1,
      LastEvaluatedKey: {
        id: "uuid1",
      },
      ScannedCount: 0,
    });
    scope.persist(false);
    nock.cleanAll();
  });

  test("should return an instance of Scan", async () => {
    const scope = nock("http://127.0.0.1:8000")
      .persist(true)
      .post("/")
      .reply(200, {
        Items: [{ id: { S: "uuid1" } }, { id: { S: "uuid2" } }],
      });

    const instance = new Scan(
      new DynatronClient({
        region: "local",
        endpoint: "http://127.0.0.1:8000",
        returnMetrics: true,
      }),
      "tableName",
    );
    instance.totalSegments(1);
    expect(
      await instance.indexName("index").start({ id: "uuid1" }).$(),
    ).toEqual({
      data: [{ id: "uuid1" }, { id: "uuid2" }],
      Count: 0,
      ScannedCount: 0,
    });
    scope.persist(false);
    nock.cleanAll();
  });

  test("should return an instance of Scan", async () => {
    const scope = nock("http://127.0.0.1:8000")
      .persist(true)
      .post("/")
      .reply(200, {
        data: [{ id: "uuid1" }, { id: "uuid2" }],
        Count: 2,
        ScannedCount: 1,
        ConsumedCapacity: { CapacityUnits: 1 },
      });

    const instance = new Scan(
      new DynatronClient({
        region: "local",
        endpoint: "http://127.0.0.1:8000",
        returnMetrics: true,
      }),
      "tableName",
    );
    instance.totalSegments(1);
    try {
      await instance.$(false);
    } catch (error: unknown) {
      expect(error).toBeDefined();
    }
    scope.persist(false);
    nock.cleanAll();
  });

  test("should retry on retryable error", async () => {
    const scope = nock("http://127.0.0.1:8000")
      .persist(true)
      .post("/")
      .replyWithError("ECONN: Connection error");

    const instance = new Scan(
      new DynatronClient({
        region: "local",
        endpoint: "http://127.0.0.1:8000",
      }),
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
    const scope = nock("http://127.0.0.1:8000")
      .persist(true)
      .post("/")
      .replyWithError("Unknown");

    const instance = new Scan(
      new DynatronClient({
        region: "local",
        endpoint: "http://127.0.0.1:8000",
      }),
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
