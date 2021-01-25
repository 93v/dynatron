import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { Scan } from "../../../src/requesters/items/1.3.2-scan";
import { BUILD } from "../../../src/utils/misc-utils";

const initialSend = DynamoDBClient.prototype.send;

let databaseClient: DynamoDBClient;

beforeAll(() => {
  databaseClient = new DynamoDBClient({ region: "local" });
});

afterAll(() => {
  DynamoDBClient.prototype.send = initialSend;
});

describe("Scan", () => {
  test("should return an instance of Scan", () => {
    const instance = new Scan(databaseClient, "tableName");
    expect(instance).toBeInstanceOf(Scan);
  });

  test("should return an instance of Scan", () => {
    const instance = new Scan(databaseClient, "tableName");
    expect(instance).toBeInstanceOf(Scan);
    instance.totalSegments();
    expect(instance[BUILD]()).toEqual({
      TableName: "tableName",
      TotalSegments: 10,
    });

    instance.totalSegments(100);
    expect(instance[BUILD]()).toEqual({
      TableName: "tableName",
      TotalSegments: 100,
    });
  });

  test("should return an instance of Scan", () => {
    const instance = new Scan(databaseClient, "tableName");
    expect(instance).toBeInstanceOf(Scan);
    instance.segment(100);
    expect(instance[BUILD]()).toEqual({
      Segment: 100,
      TableName: "tableName",
      TotalSegments: 10,
    });
  });

  test("should return an instance of Scan", () => {
    const instance = new Scan(databaseClient, "tableName");
    expect(instance).toBeInstanceOf(Scan);
    instance.disableSegments();
    expect(instance[BUILD]()).toEqual({
      TableName: "tableName",
      TotalSegments: undefined,
    });
  });

  test("should return an instance of Scan", async () => {
    DynamoDBClient.prototype.send = async () => {
      return {};
    };

    const instance = new Scan(databaseClient, "tableName");
    expect(await instance.$(true, true)).toEqual({
      Count: 0,
      Items: [],
      LastEvaluatedKey: undefined,
      ScannedCount: 0,
    });
  });

  test("should return an instance of Scan", async () => {
    DynamoDBClient.prototype.send = async () => {
      return {
        Items: [{ id: { S: "uuid1" } }, { id: { S: "uuid2" } }],
      };
    };

    const instance = new Scan(databaseClient, "tableName");
    instance.totalSegments(1);
    expect(await instance.$(true)).toEqual({
      Count: 0,
      Items: [
        {
          id: {
            S: "uuid1",
          },
        },
        {
          id: {
            S: "uuid2",
          },
        },
      ],
      LastEvaluatedKey: undefined,
      ScannedCount: 0,
    });
  });

  test("should return an instance of Scan", async () => {
    DynamoDBClient.prototype.send = async () => {
      return {
        Items: [{ id: { S: "uuid1" } }, { id: { S: "uuid2" } }],
      };
    };

    const instance = new Scan(databaseClient, "tableName");
    instance.totalSegments(1);
    expect(await instance.limit(1).$()).toEqual([{ id: "uuid1" }]);
  });

  test("should return an instance of Scan", async () => {
    DynamoDBClient.prototype.send = async () => {
      return {
        LastEvaluatedKey: { id: { S: "uuid1" } },
        Items: [{ id: { S: "uuid1" } }, { id: { S: "uuid2" } }],
      };
    };

    const instance = new Scan(databaseClient, "tableName");
    instance.totalSegments(1);
    expect(await instance.limit(1).$(false, true)).toEqual([{ id: "uuid1" }]);
  });

  test("should return an instance of Scan", async () => {
    DynamoDBClient.prototype.send = async () => {
      return {
        LastEvaluatedKey: { id: { S: "uuid1" } },
        Items: [{ id: { S: "uuid1" } }, { id: { S: "uuid2" } }],
      };
    };

    const instance = new Scan(databaseClient, "tableName");
    instance.totalSegments(1);
    expect(await instance.limit(1).$()).toEqual([{ id: "uuid1" }]);
  });

  test("should return an instance of Scan", async () => {
    DynamoDBClient.prototype.send = async () => {
      return {
        Items: [{ id: { S: "uuid1" } }, { id: { S: "uuid2" } }],
      };
    };

    const instance = new Scan(databaseClient, "tableName");
    instance.totalSegments(1);
    expect(
      await instance.indexName("index").start({ id: "uuid1" }).$(),
    ).toEqual([{ id: "uuid1" }, { id: "uuid2" }]);
  });

  test("should return an instance of Scan", async () => {
    DynamoDBClient.prototype.send = async () => {
      return {};
    };

    const instance = new Scan(databaseClient, "tableName");
    instance.totalSegments(1);
    expect(await instance.segment(1).$(true)).toEqual({
      Count: 0,
      Items: [],
      ScannedCount: 0,
    });

    instance.disableSegments();
    expect(await instance.segment(1).$(true)).toEqual({
      Count: 0,
      Items: [],
      ScannedCount: 0,
    });
  });

  test("should return an instance of Scan", async () => {
    DynamoDBClient.prototype.send = async () => {
      return {
        Items: [{ id: { S: "uuid1" } }, { id: { S: "uuid2" } }],
        Count: 2,
        ScannedCount: 1,
        ConsumedCapacity: { CapacityUnits: 1 },
      };
    };

    const instance = new Scan(databaseClient, "tableName");
    instance.totalSegments(1);
    expect(await instance.$(true, false)).toEqual({
      Items: [{ id: { S: "uuid1" } }, { id: { S: "uuid2" } }],
      Count: 2,
      ScannedCount: 1,
      ConsumedCapacity: { CapacityUnits: 1 },
    });
  });

  test("should return an instance of Scan", async () => {
    DynamoDBClient.prototype.send = async () => {
      throw new Error("ECONN");
    };

    const instance = new Scan(databaseClient, "tableName");
    try {
      await instance.$();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  test("should return an instance of Scan", async () => {
    DynamoDBClient.prototype.send = async () => {
      throw new Error("Unknown");
    };

    const instance = new Scan(databaseClient, "tableName");

    try {
      await instance.$();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});
