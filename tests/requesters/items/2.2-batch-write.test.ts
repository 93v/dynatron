import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { Amend } from "../../../src/requesters/_core/items-amend";
import { BatchWrite } from "../../../src/requesters/batch/batch-write";
import { BUILD } from "../../../src/utils/misc-utils";

const initialSend = DynamoDBClient.prototype.send;

let databaseClient: DynamoDBClient;

beforeAll(() => {
  databaseClient = new DynamoDBClient({ region: "local" });
});

afterAll(() => {
  DynamoDBClient.prototype.send = initialSend;
});

describe("Item BatchWrite", () => {
  test("should return an instance of Request", () => {
    const instance = new BatchWrite(databaseClient, "tableName", []);
    expect(instance).toBeInstanceOf(Amend);
  });

  test("should return an instance of BatchWrite", () => {
    const instance = new BatchWrite(databaseClient, "tableName", []);

    expect(instance[BUILD]()).toEqual({
      TableName: "tableName",
      _Keys: [],
    });
  });

  test("should return an instance of BatchWrite", async () => {
    DynamoDBClient.prototype.send = async () => {
      return {};
    };

    const instance = new BatchWrite(databaseClient, "tableName", [
      { id: "uuid1" },
      { id: "uuid2" },
      { id: "uuid3" },
      { id: "uuid4" },
      { id: "uuid5" },
    ]);

    expect(
      await instance
        .returnConsumedCapacity()
        .returnItemCollectionMetrics()
        .$(true),
    ).toEqual({});
  });

  test("should return an instance of BatchWrite", () => {
    const instance = new BatchWrite(databaseClient, "tableName", undefined, []);

    expect(instance[BUILD]()).toEqual({
      TableName: "tableName",
      _Items: [],
    });
  });

  test("should return an instance of BatchWrite", async () => {
    DynamoDBClient.prototype.send = async () => {
      return {};
    };

    const instance = new BatchWrite(databaseClient, "tableName", undefined, [
      { id: "uuid1" },
      { id: "uuid2" },
      { id: "uuid3" },
      { id: "uuid4" },
      { id: "uuid5" },
    ]);

    expect(
      await instance.returnConsumedCapacity().returnItemCollectionMetrics().$(),
    ).toEqual([
      { id: "uuid1" },
      { id: "uuid2" },
      { id: "uuid3" },
      { id: "uuid4" },
      { id: "uuid5" },
    ]);
  });

  test("should return an instance of BatchWrite", async () => {
    const items = Array.from({ length: 50 }).map((_, index) => ({
      id: "uuid" + index,
    }));

    let page = 1;
    DynamoDBClient.prototype.send = async () => {
      page -= 1;
      return page >= 0
        ? {
            Responses: {
              tableName: [{ id: { S: "uuid1" } }, { id: { S: "uuid2" } }],
            },
            UnprocessedItems: {
              tableName: items,
            },
          }
        : {
            Responses: {
              tableName: [{ id: { S: "uuid1" } }, { id: { S: "uuid2" } }],
            },
            ConsumedCapacity: [{ CapacityUnits: 2 }],
          };
    };

    const instance = new BatchWrite(databaseClient, "tableName", items);
    expect(await instance.returnConsumedCapacity().$()).toBeUndefined();
  });

  test("should return an instance of BatchWrite", async () => {
    const items = Array.from({ length: 50 }).map((_, index) => ({
      id: "uuid" + index,
    }));

    let page = 1;
    DynamoDBClient.prototype.send = async () => {
      page -= 1;
      return page >= 0
        ? {
            Responses: {
              tableName: [{ id: { S: "uuid1" } }, { id: { S: "uuid2" } }],
            },
            UnprocessedItems: {
              tableName: items,
            },
            ItemCollectionMetrics: {
              tableName: [],
            },
          }
        : {
            Responses: {
              tableName: [{ id: { S: "uuid1" } }, { id: { S: "uuid2" } }],
            },
            ConsumedCapacity: [{ CapacityUnits: 2 }],
            ItemCollectionMetrics: {
              tableName: [],
            },
          };
    };

    const instance = new BatchWrite(databaseClient, "tableName", items);
    expect(
      await instance
        .returnConsumedCapacity()
        .returnItemCollectionMetrics()
        .$(true),
    ).toEqual({
      ConsumedCapacity: [{ CapacityUnits: 4 }],
      ItemCollectionMetrics: { tableName: [] },
    });
  });

  test("should return an instance of BatchWrite", async () => {
    const items = Array.from({ length: 50 }).map((_, index) => ({
      id: "uuid" + index,
    }));

    let page = 1;
    DynamoDBClient.prototype.send = async () => {
      page -= 1;
      return page >= 0
        ? {
            Responses: {
              tableName: [{ id: { S: "uuid1" } }, { id: { S: "uuid2" } }],
            },
            UnprocessedItems: {
              tableName: items,
            },
            ItemCollectionMetrics: {
              tableName2: [],
            },
          }
        : {
            Responses: {
              tableName: [{ id: { S: "uuid1" } }, { id: { S: "uuid2" } }],
            },
            ConsumedCapacity: [{ CapacityUnits: 2 }],
            ItemCollectionMetrics: {
              tableName2: [],
            },
          };
    };

    const instance = new BatchWrite(databaseClient, "tableName", items);
    expect(
      await instance
        .returnConsumedCapacity()
        .returnItemCollectionMetrics()
        .$(true),
    ).toEqual({
      ConsumedCapacity: [{ CapacityUnits: 4 }],
      ItemCollectionMetrics: { tableName: [], tableName2: [] },
    });
  });

  test("should return an instance of BatchWrite", async () => {
    const items = Array.from({ length: 50 }).map((_, index) => ({
      id: "uuid" + index,
    }));

    let page = 1;
    DynamoDBClient.prototype.send = async () => {
      page -= 1;
      return page >= 0
        ? {
            Responses: {
              tableName: [{ id: { S: "uuid1" } }, { id: { S: "uuid2" } }],
            },
            UnprocessedItems: {
              tableName: items,
            },
            ConsumedCapacity: [{ CapacityUnits: 2 }],
            ItemCollectionMetrics: {
              tableName2: [],
            },
          }
        : {
            Responses: {
              tableName: [{ id: { S: "uuid1" } }, { id: { S: "uuid2" } }],
            },
            ConsumedCapacity: [{ CapacityUnits: 2 }],
            ItemCollectionMetrics: {
              tableName2: [],
            },
          };
    };

    const instance = new BatchWrite(databaseClient, "tableName", items);
    expect(
      await instance
        .returnConsumedCapacity()
        .returnItemCollectionMetrics()
        .$(true),
    ).toEqual({
      ConsumedCapacity: [{ CapacityUnits: 6 }],
      ItemCollectionMetrics: { tableName: [], tableName2: [] },
    });
  });

  test("should return an instance of BatchWrite", async () => {
    const items = Array.from({ length: 50 }).map((_, index) => ({
      id: "uuid" + index,
    }));

    let page = 1;
    DynamoDBClient.prototype.send = async () => {
      page -= 1;
      return page >= 0
        ? {
            Responses: {
              tableName: [{ id: { S: "uuid1" } }, { id: { S: "uuid2" } }],
            },
            UnprocessedItems: {
              tableName: items,
            },
            ConsumedCapacity: [],
            ItemCollectionMetrics: {
              tableName2: [],
            },
          }
        : {
            Responses: {
              tableName: [{ id: { S: "uuid1" } }, { id: { S: "uuid2" } }],
            },
            ConsumedCapacity: [],
            ItemCollectionMetrics: {
              tableName2: [],
            },
          };
    };

    const instance = new BatchWrite(databaseClient, "tableName", items);
    expect(
      await instance
        .returnConsumedCapacity()
        .returnItemCollectionMetrics()
        .$(true),
    ).toEqual({
      ConsumedCapacity: [],
      ItemCollectionMetrics: { tableName: [], tableName2: [] },
    });
  });

  test("should return an instance of BatchWrite", async () => {
    const items = Array.from({ length: 50 }).map((_, index) => ({
      id: "uuid" + index,
    }));

    let page = 1;
    DynamoDBClient.prototype.send = async () => {
      page -= 1;
      return page >= 0
        ? {
            Responses: {
              tableName: [{ id: { S: "uuid1" } }, { id: { S: "uuid2" } }],
            },
            UnprocessedItems: {
              tableName: items,
            },
            ConsumedCapacity: [],
            ItemCollectionMetrics: {
              tableName2: [],
            },
          }
        : {
            Responses: {
              tableName: [{ id: { S: "uuid1" } }, { id: { S: "uuid2" } }],
            },
            ConsumedCapacity: [{ CapacityUnits: 2 }],
            ItemCollectionMetrics: {
              tableName2: [],
            },
          };
    };

    const instance = new BatchWrite(databaseClient, "tableName", items);
    expect(
      await instance
        .returnConsumedCapacity()
        .returnItemCollectionMetrics()
        .$(true),
    ).toEqual({
      ConsumedCapacity: [],
      ItemCollectionMetrics: { tableName: [], tableName2: [] },
    });
  });

  test("should return an instance of BatchWrite", async () => {
    const items = Array.from({ length: 50 }).map((_, index) => ({
      id: "uuid" + index,
    }));

    let page = 1;
    DynamoDBClient.prototype.send = async () => {
      page -= 1;
      return page >= 0
        ? {
            Responses: {
              tableName: [{ id: { S: "uuid1" } }, { id: { S: "uuid2" } }],
            },
            UnprocessedItems: {
              tableName: items,
            },
          }
        : {
            Responses: {
              tableName: [{ id: { S: "uuid1" } }, { id: { S: "uuid2" } }],
            },
            ConsumedCapacity: [{ CapacityUnits: 2 }],
            ItemCollectionMetrics: {
              tableName: [],
            },
          };
    };

    const instance = new BatchWrite(databaseClient, "tableName", items);
    expect(
      await instance
        .returnConsumedCapacity()
        .returnItemCollectionMetrics()
        .$(true),
    ).toEqual({
      ConsumedCapacity: [{ CapacityUnits: 4 }],
      ItemCollectionMetrics: { tableName: [] },
    });
  });

  test("should return an instance of BatchWrite", async () => {
    const items = Array.from({ length: 50 }).map((_, index) => ({
      id: "uuid" + index,
    }));

    let page = 1;
    DynamoDBClient.prototype.send = async () => {
      page -= 1;
      return page >= 0
        ? {
            Responses: {
              tableName: [{ id: { S: "uuid1" } }, { id: { S: "uuid2" } }],
            },
            UnprocessedItems: {
              tableName: items,
            },
            ConsumedCapacity: [{ CapacityUnits: 2 }],
          }
        : {
            Responses: {
              tableName: [{ id: { S: "uuid1" } }, { id: { S: "uuid2" } }],
            },
            ConsumedCapacity: [],
            ItemCollectionMetrics: {
              tableName: [],
            },
          };
    };

    const instance = new BatchWrite(databaseClient, "tableName", items);
    expect(
      await instance
        .returnConsumedCapacity()
        .returnItemCollectionMetrics()
        .$(true),
    ).toEqual({
      ConsumedCapacity: [{ CapacityUnits: 2 }],
      ItemCollectionMetrics: { tableName: [] },
    });
  });

  test("should return an instance of BatchWrite", async () => {
    const items = Array.from({ length: 50 }).map((_, index) => ({
      id: "uuid" + index,
    }));

    let page = 1;
    DynamoDBClient.prototype.send = async () => {
      page -= 1;
      return page >= 0
        ? {
            Responses: {
              tableName: [{ id: { S: "uuid1" } }, { id: { S: "uuid2" } }],
            },
            UnprocessedItems: {
              tableName: items,
            },
          }
        : {
            Responses: {
              tableName: [{ id: { S: "uuid1" } }, { id: { S: "uuid2" } }],
            },
          };
    };

    const instance = new BatchWrite(databaseClient, "tableName", items);
    expect(await instance.returnConsumedCapacity().$(true)).toEqual({});
  });

  test("should return an instance of BatchWrite", async () => {
    const items = Array.from({ length: 50 }).map((_, index) => ({
      id: "uuid" + index,
    }));

    DynamoDBClient.prototype.send = async () => {
      throw new Error("ECONN");
    };

    const instance = new BatchWrite(databaseClient, "tableName", items);
    try {
      await instance.$();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  test("should return an instance of BatchWrite", async () => {
    const items = Array.from({ length: 50 }).map((_, index) => ({
      id: "uuid" + index,
    }));

    DynamoDBClient.prototype.send = async () => {
      throw new Error("Unknown");
    };

    const instance = new BatchWrite(databaseClient, "tableName", items);
    try {
      await instance.$();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  test("should return an instance of BatchWrite", async () => {
    DynamoDBClient.prototype.send = async () => {
      throw new Error("ECONN");
    };

    const instance = new BatchWrite(databaseClient, "tableName", []);
    try {
      await instance.$();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  test("should return an instance of BatchWrite", async () => {
    DynamoDBClient.prototype.send = async () => {
      throw new Error("Unknown");
    };

    const instance = new BatchWrite(databaseClient, "tableName", []);

    try {
      await instance.$();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});
