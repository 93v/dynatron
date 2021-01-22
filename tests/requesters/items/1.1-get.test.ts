import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { Fetch } from "../../../src/requesters/items/1-fetch";
import { Get } from "../../../src/requesters/items/1.1-get";
import { BUILD } from "../../../src/utils/misc-utils";

const initialSend = DynamoDBClient.prototype.send;

let databaseClient: DynamoDBClient;

beforeAll(() => {
  databaseClient = new DynamoDBClient({ region: "local" });
});

afterAll(() => {
  DynamoDBClient.prototype.send = initialSend;
});

describe("Item Get", () => {
  test("should return an instance of Fetch", () => {
    const instance = new Get(databaseClient, "tableName", { id: "uuid" });
    expect(instance).toBeInstanceOf(Fetch);
  });

  test("should return an instance of Get", () => {
    const instance = new Get(databaseClient, "tableName", { id: "uuid" });
    expect(instance).toBeInstanceOf(Get);
    expect(instance[BUILD]()).toEqual({
      TableName: "tableName",
      _Key: { id: "uuid" },
    });
  });

  test("should return an instance of Get", async () => {
    DynamoDBClient.prototype.send = async () => {
      return {};
    };

    const instance = new Get(databaseClient, "tableName", { id: "uuid" });
    expect(await instance.$()).toBeUndefined();
  });

  test("should return an instance of Get", async () => {
    DynamoDBClient.prototype.send = async () => {
      return {
        Item: {
          id: { S: "uuid" },
        },
      };
    };

    const instance = new Get(databaseClient, "tableName", { id: "uuid" });
    expect(await instance.$()).toEqual({ id: "uuid" });
  });

  test("should return an instance of Get", async () => {
    DynamoDBClient.prototype.send = async () => {
      return {
        Item: {
          id: { S: "uuid" },
        },
      };
    };

    const instance = new Get(databaseClient, "tableName", { id: "uuid" });
    expect(await instance.$(true)).toEqual({ Item: { id: { S: "uuid" } } });
  });

  test("should return an instance of Get", async () => {
    DynamoDBClient.prototype.send = async () => {
      throw new Error("ECONN");
    };

    const instance = new Get(databaseClient, "tableName", { id: "uuid" });
    try {
      await instance.$();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  test("should return an instance of Get", async () => {
    DynamoDBClient.prototype.send = async () => {
      throw new Error("Unknown");
    };

    const instance = new Get(databaseClient, "tableName", { id: "uuid" });

    try {
      await instance.$();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});
