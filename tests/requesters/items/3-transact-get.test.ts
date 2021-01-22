import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { Dynatron } from "../../../src/dynatron-class";
import { Request } from "../../../src/requesters/items/0-request";
import { TransactGet } from "../../../src/requesters/items/3-transact-get";
import { BUILD } from "../../../src/utils/misc-utils";

const initialSend = DynamoDBClient.prototype.send;

let databaseClient: DynamoDBClient;

beforeAll(() => {
  databaseClient = new DynamoDBClient({ region: "local" });
});

afterAll(() => {
  DynamoDBClient.prototype.send = initialSend;
});

describe("Item TransactGet", () => {
  test("should return an instance of Request", () => {
    const instance = new TransactGet(databaseClient, "tableName", []);
    expect(instance).toBeInstanceOf(Request);
  });

  test("should return an instance of TransactGet", () => {
    const instance = new TransactGet(databaseClient, "", [
      new Dynatron("tableName1").get({ id: "uuid1" }).select("value"),
      new Dynatron("tableName2").get({ id: "uuid2" }).select("id", "value"),
      new Dynatron("tableName3").get({ id: "uuid3" }).select("id", "value"),
    ]);
    expect(instance.returnConsumedCapacity()).toBeInstanceOf(TransactGet);
    expect(instance[BUILD]()).toEqual({
      TableName: "",
      ReturnConsumedCapacity: "TOTAL",
    });
  });

  test("should return an instance of TransactGet", async () => {
    DynamoDBClient.prototype.send = async () => {
      return {
        Responses: [
          {
            Item: {
              id: { S: "uuid" },
            },
          },
        ],
      };
    };

    const instance = new TransactGet(databaseClient, "", [
      new Dynatron("tableName1").get({ id: "uuid1" }).select("value"),
      new Dynatron("tableName2").get({ id: "uuid2" }).select("id", "value"),
      new Dynatron("tableName3").get({ id: "uuid3" }).select("id", "value"),
    ]);
    expect(instance.returnConsumedCapacity()).toBeInstanceOf(TransactGet);
    expect(await instance.$()).toEqual([{ id: "uuid" }]);
  });

  test("should return an instance of TransactGet", async () => {
    DynamoDBClient.prototype.send = async () => {
      return {};
    };

    const instance = new TransactGet(databaseClient, "", [
      new Dynatron("tableName1").get({ id: "uuid1" }).select("value"),
      new Dynatron("tableName2").get({ id: "uuid2" }).select("id", "value"),
      new Dynatron("tableName3").get({ id: "uuid3" }).select("id", "value"),
    ]);
    expect(instance.returnConsumedCapacity()).toBeInstanceOf(TransactGet);
    expect(await instance.$(true)).toEqual({});
  });

  test("should return an instance of TransactGet", async () => {
    DynamoDBClient.prototype.send = async () => {
      return {};
    };

    const instance = new TransactGet(databaseClient, "", [
      new Dynatron("tableName1").get({ id: "uuid1" }).select("value"),
      new Dynatron("tableName2").get({ id: "uuid2" }).select("id", "value"),
      new Dynatron("tableName3").get({ id: "uuid3" }).select("id", "value"),
    ]);
    expect(instance.returnConsumedCapacity()).toBeInstanceOf(TransactGet);
    expect(await instance.$()).toBeUndefined();
  });

  test("should return an instance of TransactGet", async () => {
    DynamoDBClient.prototype.send = async () => {
      throw new Error("ECONN");
    };

    const instance = new TransactGet(databaseClient, "tableName", []);
    try {
      await instance.$();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  test("should return an instance of TransactGet", async () => {
    DynamoDBClient.prototype.send = async () => {
      throw new Error("Unknown");
    };

    const instance = new TransactGet(databaseClient, "tableName", []);

    try {
      await instance.$();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});
