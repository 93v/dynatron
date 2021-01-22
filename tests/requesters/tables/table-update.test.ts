import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { TableUpdate } from "../../../src/requesters/tables/table-update";
import { BUILD } from "../../../src/utils/misc-utils";

const initialSend = DynamoDBClient.prototype.send;

let databaseClient: DynamoDBClient;

beforeAll(() => {
  databaseClient = new DynamoDBClient({ region: "local" });
});

afterAll(() => {
  DynamoDBClient.prototype.send = initialSend;
});

describe("Table Update", () => {
  test("should return an instance of TableUpdate", () => {
    const instance = new TableUpdate(databaseClient, {
      TableName: "tableName",
    });
    expect(instance).toBeInstanceOf(TableUpdate);
    expect(instance[BUILD]()).toEqual({ TableName: "tableName" });
  });

  test("should return an instance of TableUpdate", async () => {
    DynamoDBClient.prototype.send = async () => {
      return {};
    };

    const instance = new TableUpdate(databaseClient, {
      TableName: "tableName",
    });
    expect(instance).toBeInstanceOf(TableUpdate);

    expect(await instance.$()).toBeUndefined();
  });

  test("should return an instance of TableUpdate", async () => {
    DynamoDBClient.prototype.send = async () => {
      throw new Error("ECONN");
    };

    const instance = new TableUpdate(databaseClient, {
      TableName: "tableName",
    });
    expect(instance).toBeInstanceOf(TableUpdate);

    try {
      await instance.$();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  test("should return an instance of TableUpdate", async () => {
    DynamoDBClient.prototype.send = async () => {
      throw new Error("Unknown");
    };

    const instance = new TableUpdate(databaseClient, {
      TableName: "tableName",
    });
    expect(instance).toBeInstanceOf(TableUpdate);

    try {
      await instance.$();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});
