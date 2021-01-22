import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { Check } from "../../../src/requesters/items/2.1-check";
import { Update } from "../../../src/requesters/items/2.1.3-update";
import { BUILD } from "../../../src/utils/misc-utils";

const initialSend = DynamoDBClient.prototype.send;

let databaseClient: DynamoDBClient;

beforeAll(() => {
  databaseClient = new DynamoDBClient({ region: "local" });
});

afterAll(() => {
  DynamoDBClient.prototype.send = initialSend;
});

describe("Item Update", () => {
  test("should return an instance of Check", () => {
    const instance = new Update(databaseClient, "tableName", { id: "uuid" });
    expect(instance).toBeInstanceOf(Check);
  });

  test("should return an instance of Update", () => {
    const instance = new Update(databaseClient, "tableName", { id: "uuid" });
    expect(instance).toBeInstanceOf(Update);
    expect(instance[BUILD]()).toEqual({
      TableName: "tableName",
      _Key: { id: "uuid" },
    });
  });

  test("should return an instance of Update", async () => {
    DynamoDBClient.prototype.send = async () => {
      return {};
    };

    const instance = new Update(databaseClient, "tableName", { id: "uuid" });
    expect(await instance.$()).toBeUndefined();
  });

  test("should return an instance of Update", async () => {
    DynamoDBClient.prototype.send = async () => {
      return {
        Attributes: {
          id: { S: "uuid" },
        },
      };
    };

    const instance = new Update(databaseClient, "tableName", { id: "uuid" });
    expect(await instance.$()).toEqual({ id: "uuid" });
  });

  test("should return an instance of Update", async () => {
    DynamoDBClient.prototype.send = async () => {
      return {
        Attributes: {
          id: { S: "uuid" },
        },
      };
    };

    const instance = new Update(databaseClient, "tableName", { id: "uuid" });
    expect(await instance.$(true)).toEqual({
      Attributes: { id: { S: "uuid" } },
    });
  });

  test("should return an instance of Update", async () => {
    DynamoDBClient.prototype.send = async () => {
      throw new Error("ECONN");
    };

    const instance = new Update(databaseClient, "tableName", { id: "uuid" });
    try {
      await instance.$();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  test("should return an instance of Update", async () => {
    DynamoDBClient.prototype.send = async () => {
      throw new Error("Unknown");
    };

    const instance = new Update(databaseClient, "tableName", { id: "uuid" });

    try {
      await instance.$();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});
