import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { TableDelete } from "../../../src/requesters/tables/table-delete";
import { BUILD } from "../../../src/utils/misc-utils";

const initialSend = DynamoDBClient.prototype.send;

let databaseClient: DynamoDBClient;

beforeAll(() => {
  databaseClient = new DynamoDBClient({ region: "local" });
});

afterAll(() => {
  DynamoDBClient.prototype.send = initialSend;
});

describe("Table Delete", () => {
  test("should return an instance of TableDelete", () => {
    const instance = new TableDelete(databaseClient, "tableName");
    expect(instance).toBeInstanceOf(TableDelete);
    expect(instance[BUILD]()).toEqual({ TableName: "tableName" });
  });

  test("should return an instance of TableDelete", async () => {
    DynamoDBClient.prototype.send = async () => {
      return {};
    };

    const instance = new TableDelete(databaseClient, "tableName");
    expect(instance).toBeInstanceOf(TableDelete);

    expect(await instance.$()).toBeUndefined();
  });

  test("should return an instance of TableDelete", async () => {
    DynamoDBClient.prototype.send = async () => {
      throw new Error("ECONN");
    };

    const instance = new TableDelete(databaseClient, "tableName");
    expect(instance).toBeInstanceOf(TableDelete);

    try {
      await instance.$();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  test("should return an instance of TableDelete", async () => {
    DynamoDBClient.prototype.send = async () => {
      throw new Error("Unknown");
    };

    const instance = new TableDelete(databaseClient, "tableName");
    expect(instance).toBeInstanceOf(TableDelete);

    try {
      await instance.$();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});
