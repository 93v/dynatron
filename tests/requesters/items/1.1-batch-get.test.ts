import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { Fetch } from "../../../src/requesters/items/1-fetch";
import { BatchGet } from "../../../src/requesters/items/1.2-batch-get";
import { BUILD } from "../../../src/utils/misc-utils";

const initialSend = DynamoDBClient.prototype.send;

let databaseClient: DynamoDBClient;

beforeAll(() => {
  databaseClient = new DynamoDBClient({ region: "local" });
});

afterAll(() => {
  DynamoDBClient.prototype.send = initialSend;
});

describe("Item BatchGet", () => {
  test("should return an instance of Fetch", () => {
    const instance = new BatchGet(databaseClient, "tableName", [
      { id: "uuid1" },
      { id: "uuid2" },
    ]);
    expect(instance).toBeInstanceOf(Fetch);
  });

  test("should return an instance of BatchGet", () => {
    const instance = new BatchGet(databaseClient, "tableName", [
      { id: "uuid1" },
      { id: "uuid2" },
    ]);
    expect(instance).toBeInstanceOf(BatchGet);
    expect(instance[BUILD]()).toEqual({
      TableName: "tableName",
      _Keys: [{ id: "uuid1" }, { id: "uuid2" }],
    });
  });

  test("should return an instance of BatchGet", async () => {
    DynamoDBClient.prototype.send = async () => {
      return {};
    };

    const instance = new BatchGet(databaseClient, "tableName", [
      { id: "uuid1" },
      { id: "uuid2" },
    ]);
    expect(await instance.$()).toEqual([]);
  });

  test("should return an instance of BatchGet", async () => {
    DynamoDBClient.prototype.send = async () => {
      return {
        Responses: {
          tableName: [{ id: { S: "uuid1" } }, { id: { S: "uuid2" } }],
        },
      };
    };

    const instance = new BatchGet(databaseClient, "tableName", [
      { id: "uuid1" },
      { id: "uuid2" },
    ]);
    expect(await instance.returnConsumedCapacity().$()).toEqual([
      { id: "uuid1" },
      { id: "uuid2" },
    ]);
  });

  test("should return an instance of BatchGet", async () => {
    DynamoDBClient.prototype.send = async () => {
      return {
        Responses: {},
      };
    };

    const instance = new BatchGet(databaseClient, "tableName", [
      { id: "uuid1" },
      { id: "uuid2" },
    ]);
    expect(await instance.returnConsumedCapacity().$()).toEqual([]);
  });

  test("should return an instance of BatchGet", async () => {
    const keys = Array.from({ length: 200 }).map((_, index) => ({
      id: "uuid" + index,
    }));

    DynamoDBClient.prototype.send = async () => {
      return {
        Responses: {},
        ConsumedCapacity: [
          {
            CapacityUnits: 1,
          },
        ],
      };
    };

    const instance = new BatchGet(databaseClient, "tableName", keys);
    expect(await instance.returnConsumedCapacity().$()).toEqual([]);
  });

  test("should return an instance of BatchGet", async () => {
    const keys = Array.from({ length: 200 }).map((_, index) => ({
      id: "uuid" + index,
    }));

    DynamoDBClient.prototype.send = async () => {
      return {
        Responses: {},
        ConsumedCapacity: [],
      };
    };

    const instance = new BatchGet(databaseClient, "tableName", keys);
    expect(await instance.returnConsumedCapacity().$()).toEqual([]);
  });

  test("should return an instance of BatchGet", async () => {
    const keys = Array.from({ length: 200 }).map((_, index) => ({
      id: "uuid" + index,
    }));

    DynamoDBClient.prototype.send = async () => {
      return {
        Responses: {},
        ConsumedCapacity: [{ CapacityUnits: undefined }],
      };
    };

    const instance = new BatchGet(databaseClient, "tableName", keys);
    expect(await instance.returnConsumedCapacity().$()).toEqual([]);
  });

  test("should return an instance of BatchGet", async () => {
    const keys = Array.from({ length: 200 }).map((_, index) => ({
      id: "uuid" + index,
    }));

    DynamoDBClient.prototype.send = async () => {
      return {};
    };

    const instance = new BatchGet(databaseClient, "tableName", keys);
    expect(await instance.returnConsumedCapacity().$()).toEqual([]);
  });

  test("should return an instance of BatchGet", async () => {
    DynamoDBClient.prototype.send = async () => {
      return {
        Responses: {
          tableName: [],
        },
      };
    };

    const instance = new BatchGet(databaseClient, "tableName", []);
    expect(await instance.returnConsumedCapacity().$()).toEqual([]);
  });

  test("should return an instance of BatchGet", async () => {
    const keys = Array.from({ length: 200 }).map((_, index) => ({
      id: "uuid" + index,
    }));

    let page = 1;
    DynamoDBClient.prototype.send = async () => {
      page -= 1;
      return page >= 0
        ? {
            UnprocessedKeys: {},
            ConsumedCapacity: [{ CapacityUnits: 1 }],
          }
        : { ConsumedCapacity: [{ CapacityUnits: 1 }] };
    };

    const instance = new BatchGet(databaseClient, "tableName", keys);
    expect(await instance.returnConsumedCapacity().$()).toEqual([]);
  });

  test("should return an instance of BatchGet", async () => {
    const keys = Array.from({ length: 200 }).map((_, index) => ({
      id: "uuid" + index,
    }));

    let page = 1;
    DynamoDBClient.prototype.send = async () => {
      page -= 1;
      return page >= 0
        ? {
            UnprocessedKeys: {
              tableName: keys,
            },
            ConsumedCapacity: [{ CapacityUnits: 1 }],
          }
        : { ConsumedCapacity: [{ CapacityUnits: 1 }] };
    };

    const instance = new BatchGet(databaseClient, "tableName", keys);
    expect(await instance.returnConsumedCapacity().$()).toEqual([]);
  });

  test("should return an instance of BatchGet", async () => {
    const keys = Array.from({ length: 200 }).map((_, index) => ({
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
            UnprocessedKeys: {
              tableName: keys,
            },
            ConsumedCapacity: [{ CapacityUnits: undefined }],
          }
        : {
            Responses: {
              tableName: [{ id: { S: "uuid1" } }, { id: { S: "uuid2" } }],
            },
            ConsumedCapacity: [{ CapacityUnits: undefined }],
          };
    };

    const instance = new BatchGet(databaseClient, "tableName", keys);
    expect(await instance.returnConsumedCapacity().$()).toEqual([
      { id: "uuid1" },
      { id: "uuid2" },
      { id: "uuid1" },
      { id: "uuid2" },
      { id: "uuid1" },
      { id: "uuid2" },
    ]);
  });

  test("should return an instance of BatchGet", async () => {
    const keys = Array.from({ length: 200 }).map((_, index) => ({
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
            UnprocessedKeys: {
              tableName: keys,
            },
            ConsumedCapacity: [{ CapacityUnits: undefined }],
          }
        : {
            Responses: {
              tableName: [{ id: { S: "uuid1" } }, { id: { S: "uuid2" } }],
            },
            ConsumedCapacity: [undefined, { CapacityUnits: undefined }],
          };
    };

    const instance = new BatchGet(databaseClient, "tableName", keys);
    expect(await instance.returnConsumedCapacity().$()).toEqual([
      { id: "uuid1" },
      { id: "uuid2" },
      { id: "uuid1" },
      { id: "uuid2" },
      { id: "uuid1" },
      { id: "uuid2" },
    ]);
  });

  test("should return an instance of BatchGet", async () => {
    const keys = Array.from({ length: 200 }).map((_, index) => ({
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
            UnprocessedKeys: {
              tableName: keys,
            },
          }
        : {
            Responses: {
              tableName: [{ id: { S: "uuid1" } }, { id: { S: "uuid2" } }],
            },
            ConsumedCapacity: [{ CapacityUnits: 2 }],
          };
    };

    const instance = new BatchGet(databaseClient, "tableName", keys);
    expect(await instance.returnConsumedCapacity().$()).toEqual([
      { id: "uuid1" },
      { id: "uuid2" },
      { id: "uuid1" },
      { id: "uuid2" },
      { id: "uuid1" },
      { id: "uuid2" },
    ]);
  });

  test("should return an instance of BatchGet", async () => {
    DynamoDBClient.prototype.send = async () => {
      return {
        Responses: {
          tableName: [{ id: { S: "uuid1" } }, { id: { S: "uuid2" } }],
        },
        ConsumedCapacity: [{ CapacityUnits: 1 }],
      };
    };

    const instance = new BatchGet(databaseClient, "tableName", [
      { id: "uuid1" },
      { id: "uuid2" },
    ]);
    expect(await instance.$(true)).toEqual({
      Responses: {
        tableName: [{ id: { S: "uuid1" } }, { id: { S: "uuid2" } }],
      },
      ConsumedCapacity: [{ CapacityUnits: 1 }],
    });
  });

  test("should return an instance of BatchGet", async () => {
    DynamoDBClient.prototype.send = async () => {
      throw new Error("ECONN");
    };

    const instance = new BatchGet(databaseClient, "tableName", [
      { id: "uuid1" },
      { id: "uuid2" },
    ]);
    try {
      await instance.$();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  test("should return an instance of BatchGet", async () => {
    DynamoDBClient.prototype.send = async () => {
      throw new Error("Unknown");
    };

    const instance = new BatchGet(databaseClient, "tableName", [
      { id: "uuid1" },
      { id: "uuid2" },
    ]);

    try {
      await instance.$();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});
