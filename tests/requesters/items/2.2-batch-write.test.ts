import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { Amend } from "../../../src/requesters/items/2-amend";
import { BatchWrite } from "../../../src/requesters/items/2.2-batch-write";
import { BUILD } from "../../../src/utils/misc-utils";

const initialSend = DynamoDBClient.prototype.send;

let databaseClient: DynamoDBClient;

beforeAll(() => {
  databaseClient = new DynamoDBClient({ region: "local" });
});

afterAll(() => {
  DynamoDBClient.prototype.send = initialSend;
});

describe("Item BatchWrite", () => {
  test("should return an instance of Request", () => {
    const instance = new BatchWrite(databaseClient, "tableName", []);
    expect(instance).toBeInstanceOf(Amend);
  });

  test("should return an instance of BatchWrite", () => {
    const instance = new BatchWrite(databaseClient, "tableName", []);

    expect(instance[BUILD]()).toEqual({
      TableName: "tableName",
      _Keys: [],
    });
  });

  test("should return an instance of BatchWrite", async () => {
    DynamoDBClient.prototype.send = async () => {
      return {};
    };

    const instance = new BatchWrite(databaseClient, "tableName", [
      { id: "uuid1" },
      { id: "uuid2" },
      { id: "uuid3" },
      { id: "uuid4" },
      { id: "uuid5" },
    ]);

    expect(
      await instance
        .returnConsumedCapacity()
        .returnItemCollectionMetrics()
        .$(true),
    ).toEqual({});
  });

  test("should return an instance of BatchWrite", () => {
    const instance = new BatchWrite(databaseClient, "tableName", undefined, []);

    expect(instance[BUILD]()).toEqual({
      TableName: "tableName",
      _Items: [],
    });
  });

  test("should return an instance of BatchWrite", async () => {
    DynamoDBClient.prototype.send = async () => {
      return {};
    };

    const instance = new BatchWrite(databaseClient, "tableName", undefined, [
      { id: "uuid1" },
      { id: "uuid2" },
      { id: "uuid3" },
      { id: "uuid4" },
      { id: "uuid5" },
    ]);

    expect(
      await instance.returnConsumedCapacity().returnItemCollectionMetrics().$(),
    ).toEqual([
      { id: "uuid1" },
      { id: "uuid2" },
      { id: "uuid3" },
      { id: "uuid4" },
      { id: "uuid5" },
    ]);
  });

  test("should return an instance of BatchWrite", async () => {
    DynamoDBClient.prototype.send = async () => {
      throw new Error("ECONN");
    };

    const instance = new BatchWrite(databaseClient, "tableName", []);
    try {
      await instance.$();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  test("should return an instance of BatchWrite", async () => {
    DynamoDBClient.prototype.send = async () => {
      throw new Error("Unknown");
    };

    const instance = new BatchWrite(databaseClient, "tableName", []);

    try {
      await instance.$();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});
