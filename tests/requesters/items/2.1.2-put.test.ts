import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { Check } from "../../../src/requesters/items/2.1-check";
import { Put } from "../../../src/requesters/items/2.1.2-put";
import { BUILD } from "../../../src/utils/misc-utils";

const initialSend = DynamoDBClient.prototype.send;

let databaseClient: DynamoDBClient;

beforeAll(() => {
  databaseClient = new DynamoDBClient({ region: "local" });
});

afterAll(() => {
  DynamoDBClient.prototype.send = initialSend;
});

describe("Item Put", () => {
  test("should return an instance of Check", () => {
    const instance = new Put(databaseClient, "tableName", { id: "uuid" });
    expect(instance).toBeInstanceOf(Check);
  });

  test("should return an instance of Put", () => {
    const instance = new Put(databaseClient, "tableName", { id: "uuid" });
    expect(instance).toBeInstanceOf(Put);
    expect(instance[BUILD]()).toEqual({
      TableName: "tableName",
      _Item: { id: "uuid" },
    });
  });

  test("should return an instance of Put", async () => {
    DynamoDBClient.prototype.send = async () => {
      return {};
    };

    const instance = new Put(databaseClient, "tableName", { id: "uuid" });
    expect(await instance.$()).toEqual({ id: "uuid" });
  });

  test("should return an instance of Put", async () => {
    DynamoDBClient.prototype.send = async () => {
      return {
        Item: {
          id: { S: "uuid" },
        },
      };
    };

    const instance = new Put(databaseClient, "tableName", { id: "uuid" });
    expect(await instance.$()).toEqual({ id: "uuid" });
  });

  test("should return an instance of Put", async () => {
    DynamoDBClient.prototype.send = async () => {
      return {
        Item: {
          id: { S: "uuid" },
        },
      };
    };

    const instance = new Put(databaseClient, "tableName", { id: "uuid" });
    expect(await instance.$(true)).toEqual({
      Item: { id: { S: "uuid" } },
    });
  });

  test("should return an instance of Put", async () => {
    DynamoDBClient.prototype.send = async () => {
      throw new Error("ECONN");
    };

    const instance = new Put(databaseClient, "tableName", { id: "uuid" });
    try {
      await instance.$();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  test("should return an instance of Put", async () => {
    DynamoDBClient.prototype.send = async () => {
      throw new Error("Unknown");
    };

    const instance = new Put(databaseClient, "tableName", { id: "uuid" });

    try {
      await instance.$();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});
