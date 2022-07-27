import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { Dynatron, DynatronClient, eq } from "../../../src";
import { Amend } from "../../../src/requesters/_core/items-amend";
import { TransactWrite } from "../../../src/requesters/transact/transact-write";
import { BUILD } from "../../../src/utils/misc-utils";

const initialSend = DynamoDBClient.prototype.send;

let databaseClient: DynatronClient;
let database: Dynatron;

beforeAll(() => {
  databaseClient = new DynatronClient({});
  database = new Dynatron(databaseClient);
});

afterAll(() => {
  DynamoDBClient.prototype.send = initialSend;
});

describe("Item TransactWrite", () => {
  test("should return an instance of Request", () => {
    const instance = new TransactWrite(databaseClient, []);
    expect(instance).toBeInstanceOf(Amend);
  });

  test("should return an instance of TransactWrite", () => {
    const instance = new TransactWrite(databaseClient, [
      database.Items("tableName1").put({ id: "uuid1" }).returnValues(),
      database.Items("tableName2").check({ id: "uuid2" }).if(eq("value", 7)),
      database.Items("tableName3").delete({ id: "uuid3" }),
      database.Items("tableName4").update({ id: "uuid4" }).assign({ value: 8 }),
    ]);
    expect(
      instance.clientRequestToken("token").returnItemCollectionMetrics(),
    ).toBeInstanceOf(TransactWrite);
    expect(instance[BUILD]()).toEqual({
      TableName: undefined,
      ClientRequestToken: "token",
      ReturnConsumedCapacity: "NONE",
      ReturnItemCollectionMetrics: "SIZE",
    });
  });

  test("should return an instance of TransactWrite", async () => {
    DynamoDBClient.prototype.send = async () => {
      return {};
    };

    const instance = new TransactWrite(databaseClient, [
      database.Items("tableName1").put({ id: "uuid1" }).returnValues(),
      database.Items("tableName2").check({ id: "uuid2" }).if(eq("value", 7)),
      database.Items("tableName3").delete({ id: "uuid3" }),
      database.Items("tableName4").update({ id: "uuid4" }).assign({ value: 8 }),
    ]);
    expect(
      instance.clientRequestToken("token").returnItemCollectionMetrics(),
    ).toBeInstanceOf(TransactWrite);
    expect(await instance.$()).toEqual({});
  });

  test("should return an instance of TransactWrite", async () => {
    DynamoDBClient.prototype.send = async () => {
      throw new Error("ECONN");
    };

    const instance = new TransactWrite(databaseClient, []);
    try {
      await instance.$();
    } catch (error: unknown) {
      expect(error).toBeDefined();
    }
  });

  test("should return an instance of TransactWrite", async () => {
    DynamoDBClient.prototype.send = async () => {
      throw new Error("Unknown");
    };

    const instance = new TransactWrite(databaseClient, []);

    try {
      await instance.$();
    } catch (error: unknown) {
      expect(error).toBeDefined();
    }
  });
});
