import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { TableCreate } from "../../../src/requesters/tables/table-create";
import { BUILD } from "../../../src/utils/misc-utils";

const initialSend = DynamoDBClient.prototype.send;

let databaseClient: DynamoDBClient;

beforeAll(() => {
  databaseClient = new DynamoDBClient({ region: "local" });
});

afterAll(() => {
  DynamoDBClient.prototype.send = initialSend;
});

describe("Table Create", () => {
  test("should return an instance of TableCreate", () => {
    const instance = new TableCreate(databaseClient, {
      AttributeDefinitions: [],
      KeySchema: [],
      TableName: "tableName",
    });
    expect(instance).toBeInstanceOf(TableCreate);
    expect(instance[BUILD]()).toEqual({
      AttributeDefinitions: [],
      KeySchema: [],
      TableName: "tableName",
    });
  });

  test("should return an instance of TableCreate", async () => {
    DynamoDBClient.prototype.send = async () => {
      return {};
    };

    const instance = new TableCreate(databaseClient, {
      AttributeDefinitions: [],
      KeySchema: [],
      TableName: "tableName",
    });
    expect(instance).toBeInstanceOf(TableCreate);

    expect(await instance.$()).toBeUndefined();
  });

  test("should return an instance of TableCreate", async () => {
    DynamoDBClient.prototype.send = async () => {
      throw new Error("ECONN");
    };

    const instance = new TableCreate(databaseClient, {
      AttributeDefinitions: [],
      KeySchema: [],
      TableName: "tableName",
    });
    expect(instance).toBeInstanceOf(TableCreate);

    try {
      await instance.$();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  test("should return an instance of TableCreate", async () => {
    DynamoDBClient.prototype.send = async () => {
      throw new Error("Unknown");
    };

    const instance = new TableCreate(databaseClient, {
      AttributeDefinitions: [],
      KeySchema: [],
      TableName: "tableName",
    });
    expect(instance).toBeInstanceOf(TableCreate);

    try {
      await instance.$();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});
