import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { TableTTLDescribe } from "../../../src/requesters/tables/table-ttl-describe";
import { BUILD } from "../../../src/utils/misc-utils";

const initialSend = DynamoDBClient.prototype.send;

let databaseClient: DynamoDBClient;

beforeAll(() => {
  databaseClient = new DynamoDBClient({ region: "local" });
});

afterAll(() => {
  DynamoDBClient.prototype.send = initialSend;
});

describe("Table TTL Describe", () => {
  test("should return an instance of TableTTLDescribe", () => {
    const instance = new TableTTLDescribe(databaseClient, "tableName");
    expect(instance).toBeInstanceOf(TableTTLDescribe);
    expect(instance[BUILD]()).toEqual({ TableName: "tableName" });
  });

  test("should return an instance of TableTTLDescribe", async () => {
    DynamoDBClient.prototype.send = async () => {
      return {};
    };

    const instance = new TableTTLDescribe(databaseClient, "tableName");
    expect(instance).toBeInstanceOf(TableTTLDescribe);

    expect(await instance.$()).toBeUndefined();
  });

  test("should return an instance of TableTTLDescribe", async () => {
    DynamoDBClient.prototype.send = async () => {
      throw new Error("ECONN");
    };

    const instance = new TableTTLDescribe(databaseClient, "tableName");
    expect(instance).toBeInstanceOf(TableTTLDescribe);

    try {
      await instance.$();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  test("should return an instance of TableTTLDescribe", async () => {
    DynamoDBClient.prototype.send = async () => {
      throw new Error("Unknown");
    };

    const instance = new TableTTLDescribe(databaseClient, "tableName");
    expect(instance).toBeInstanceOf(TableTTLDescribe);

    try {
      await instance.$();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});
