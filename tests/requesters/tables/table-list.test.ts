import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { TableList } from "../../../src/requesters/tables/table-list";
import { BUILD } from "../../../src/utils/misc-utils";

const initialSend = DynamoDBClient.prototype.send;

let databaseClient: DynamoDBClient;

beforeAll(() => {
  databaseClient = new DynamoDBClient({ region: "local" });
});

afterAll(() => {
  DynamoDBClient.prototype.send = initialSend;
});

describe("Table List", () => {
  test("should return an instance of TableList", () => {
    const instance = new TableList(databaseClient);
    expect(instance).toBeInstanceOf(TableList);
    expect(instance[BUILD]()).toEqual({});
  });

  test("should return an instance of TableList", () => {
    const instance = new TableList(databaseClient);
    instance.limit(1);
    expect(instance).toBeInstanceOf(TableList);
    expect(instance[BUILD]()).toEqual({ Limit: 1 });
  });

  test("should throw", () => {
    const instance = new TableList(databaseClient);
    expect(() => instance.limit(-1)).toThrow();
  });

  test("should return an instance of TableList", () => {
    const instance = new TableList(databaseClient);
    instance.start();
    expect(instance).toBeInstanceOf(TableList);
    expect(instance[BUILD]()).toEqual({});

    instance.start("startTableName");
    expect(instance).toBeInstanceOf(TableList);
    expect(instance[BUILD]()).toEqual({
      ExclusiveStartTableName: "startTableName",
    });
  });

  test("should return an instance of TableList", () => {
    const instance = new TableList(databaseClient);
    expect(instance).toBeInstanceOf(TableList);
    expect(instance[BUILD]()).toEqual({});
  });

  test("should return an instance of TableList", () => {
    const instance = new TableList(databaseClient);
    expect(instance).toBeInstanceOf(TableList);
    expect(instance[BUILD]()).toEqual({});
  });

  test("should return an instance of TableList", async () => {
    DynamoDBClient.prototype.send = async () => {
      return {};
    };

    const instance = new TableList(databaseClient);
    expect(instance).toBeInstanceOf(TableList);

    expect(await instance.$()).toBeUndefined();
  });

  test("should return an instance of TableList", async () => {
    DynamoDBClient.prototype.send = async () => {
      throw new Error("ECONN");
    };

    const instance = new TableList(databaseClient);
    expect(instance).toBeInstanceOf(TableList);

    try {
      await instance.$();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  test("should return an instance of TableList", async () => {
    DynamoDBClient.prototype.send = async () => {
      throw new Error("Unknown");
    };

    const instance = new TableList(databaseClient);
    expect(instance).toBeInstanceOf(TableList);

    try {
      await instance.$();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});
