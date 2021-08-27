import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { Amend } from "../../../src/requesters/_core/items-amend";
import { BatchWrite } from "../../../src/requesters/batch/batch-write";
import { BUILD } from "../../../src/utils/misc-utils";
import { DynatronClient, Dynatron } from "../../../src";

const initialSend = DynamoDBClient.prototype.send;

let databaseClient: DynatronClient;
let database: Dynatron;

beforeAll(() => {
  databaseClient = new DynatronClient({});
  database = new Dynatron(databaseClient);
});

afterAll(() => {
  DynamoDBClient.prototype.send = initialSend;
});

describe("Item BatchWrite", () => {
  test("should return an instance of Request", () => {
    const instance = new BatchWrite(databaseClient, []);
    expect(instance).toBeInstanceOf(Amend);
  });

  test("should return an instance of BatchWrite", () => {
    const instance = new BatchWrite(databaseClient, []);

    expect(instance[BUILD]()).toEqual({
      ReturnConsumedCapacity: "INDEXES",
      TableName: undefined,
    });
  });

  test("should return an instance of BatchWrite", () => {
    const instance = new BatchWrite(databaseClient, []);

    expect(instance[BUILD]()).toEqual({
      ReturnConsumedCapacity: "INDEXES",
      TableName: undefined,
    });
  });

  test("should return an instance of BatchWrite", async () => {
    DynamoDBClient.prototype.send = async () => {
      return {};
    };

    const instance = new BatchWrite(databaseClient, [
      database.Items("tableName").put({ id: "uuid1" }),
      database.Items("tableName").put({ id: "uuid2" }),
      database.Items("tableName").put({ id: "uuid3" }),
      database.Items("tableName").put({ id: "uuid4" }),
      database.Items("tableName").put({ id: "uuid5" }),
    ]);

    expect(await instance.returnItemCollectionMetrics().$()).toEqual({
      ConsumedCapacity: [],
      data: {
        tableName: [
          { id: "uuid1" },
          { id: "uuid2" },
          { id: "uuid3" },
          { id: "uuid4" },
          { id: "uuid5" },
        ],
      },
    });
  });

  test("should return an instance of BatchWrite", async () => {
    const items = Array.from({ length: 50 }).map((_, index) => ({
      id: "uuid" + index,
    }));

    let page = 0;
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
            ConsumedCapacity: [{ CapacityUnits: 4 }],
          };
    };

    const instance = new BatchWrite(
      databaseClient,
      items.map((k) => database.Items("tableName").put(k)),
    );
    expect(await instance.$()).toEqual({
      ConsumedCapacity: [],
      data: { tableName: items },
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

    const instance = new BatchWrite(
      databaseClient,
      items.map((k) => database.Items("tableName").put(k)),
    );
    expect(await instance.returnItemCollectionMetrics().$()).toEqual({
      ConsumedCapacity: [],
      ItemCollectionMetrics: { tableName: [] },
      data: {
        tableName: items.slice(-25),
      },
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

    const instance = new BatchWrite(
      databaseClient,
      items.map((k) => database.Items("tableName").put(k)),
    );
    expect(await instance.returnItemCollectionMetrics().$()).toEqual({
      ConsumedCapacity: [],
      ItemCollectionMetrics: { tableName2: [] },
      data: {
        tableName: items.slice(-25),
      },
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

    const instance = new BatchWrite(
      databaseClient,
      items.map((k) => database.Items("tableName").put(k)),
    );
    expect(await instance.returnItemCollectionMetrics().$()).toEqual({
      ConsumedCapacity: [],
      ItemCollectionMetrics: { tableName2: [] },
      data: {
        tableName: items.slice(-25),
      },
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

    const instance = new BatchWrite(
      databaseClient,
      items.map((k) => database.Items("tableName").put(k)),
    );
    expect(await instance.returnItemCollectionMetrics().$()).toEqual({
      ConsumedCapacity: [],
      ItemCollectionMetrics: { tableName2: [] },
      data: {
        tableName: items.slice(-25),
      },
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

    const instance = new BatchWrite(
      databaseClient,
      items.map((k) => database.Items("tableName").put(k)),
    );
    expect(await instance.returnItemCollectionMetrics().$()).toEqual({
      ConsumedCapacity: [],
      ItemCollectionMetrics: { tableName2: [] },
      data: {
        tableName: items.slice(-25),
      },
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

    const instance = new BatchWrite(
      databaseClient,
      items.map((k) => database.Items("tableName").put(k)),
    );
    expect(await instance.returnItemCollectionMetrics().$()).toEqual({
      ConsumedCapacity: [],
      ItemCollectionMetrics: { tableName: [] },
      data: {
        tableName: items.slice(-25),
      },
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

    const instance = new BatchWrite(
      databaseClient,
      items.map((k) => database.Items("tableName").put(k)),
    );
    expect(await instance.returnItemCollectionMetrics().$()).toEqual({
      ConsumedCapacity: [],
      ItemCollectionMetrics: { tableName: [] },
      data: {
        tableName: items.slice(-25),
      },
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

    const instance = new BatchWrite(
      databaseClient,
      items.map((k) => database.Items("tableName").put(k)),
    );
    expect(await instance.$()).toEqual({
      ConsumedCapacity: [],
      data: {
        tableName: items.slice(-25),
      },
    });
  });

  test("should return an instance of BatchWrite", async () => {
    const items = Array.from({ length: 50 }).map((_, index) => ({
      id: "uuid" + index,
    }));

    DynamoDBClient.prototype.send = async () => {
      throw new Error("ECONN");
    };

    const instance = new BatchWrite(
      databaseClient,
      items.map((k) => database.Items("tableName").put(k)),
    );
    try {
      await instance.$();
    } catch (error: unknown) {
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

    const instance = new BatchWrite(
      databaseClient,
      items.map((k) => database.Items("tableName").put(k)),
    );
    try {
      await instance.$();
    } catch (error: unknown) {
      expect(error).toBeDefined();
    }
  });

  test("should return an instance of BatchWrite", async () => {
    DynamoDBClient.prototype.send = async () => {
      throw new Error("ECONN");
    };

    const instance = new BatchWrite(databaseClient, []);
    try {
      await instance.$();
    } catch (error: unknown) {
      expect(error).toBeDefined();
    }
  });

  test("should return an instance of BatchWrite", async () => {
    DynamoDBClient.prototype.send = async () => {
      throw new Error("Unknown");
    };

    const instance = new BatchWrite(databaseClient, []);

    try {
      await instance.$();
    } catch (error: unknown) {
      expect(error).toBeDefined();
    }
  });
});
