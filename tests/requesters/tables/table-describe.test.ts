import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { TableDescribe } from "../../../src/requesters/tables/table-describe";
import { BUILD } from "../../../src/utils/misc-utils";

const initialSend = DynamoDBClient.prototype.send;

let databaseClient: DynamoDBClient;

beforeAll(() => {
  databaseClient = new DynamoDBClient({ region: "local" });
});

afterAll(() => {
  DynamoDBClient.prototype.send = initialSend;
});

describe("Table Describe", () => {
  test("should return an instance of TableDescribe", () => {
    const instance = new TableDescribe(databaseClient, "tableName");
    expect(instance).toBeInstanceOf(TableDescribe);
    expect(instance[BUILD]()).toEqual({ TableName: "tableName" });
  });

  test("should return an instance of TableDescribe", async () => {
    DynamoDBClient.prototype.send = async () => {
      return {};
    };

    const instance = new TableDescribe(databaseClient, "tableName");
    expect(instance).toBeInstanceOf(TableDescribe);

    expect(await instance.$()).toBeUndefined();
  });

  test("should return an instance of TableDescribe", async () => {
    DynamoDBClient.prototype.send = async () => {
      throw new Error("ECONN");
    };

    const instance = new TableDescribe(databaseClient, "tableName");
    expect(instance).toBeInstanceOf(TableDescribe);

    try {
      await instance.$();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  test("should return an instance of TableDescribe", async () => {
    DynamoDBClient.prototype.send = async () => {
      throw new Error("Unknown");
    };

    const instance = new TableDescribe(databaseClient, "tableName");
    expect(instance).toBeInstanceOf(TableDescribe);

    try {
      await instance.$();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});
