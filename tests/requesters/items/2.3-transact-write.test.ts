import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { eq } from "../../../src/condition-expression-builders";
import { Dynatron } from "../../../src/dynatron-class";
import { Amend } from "../../../src/requesters/items/2-amend";
import { TransactWrite } from "../../../src/requesters/items/2.3-transact-write";
import { BUILD } from "../../../src/utils/misc-utils";

const initialSend = DynamoDBClient.prototype.send;

let databaseClient: DynamoDBClient;

beforeAll(() => {
  databaseClient = new DynamoDBClient({ region: "local" });
});

afterAll(() => {
  DynamoDBClient.prototype.send = initialSend;
});

describe("Item TransactWrite", () => {
  test("should return an instance of Request", () => {
    const instance = new TransactWrite(databaseClient, "tableName", []);
    expect(instance).toBeInstanceOf(Amend);
  });

  test("should return an instance of TransactWrite", () => {
    const instance = new TransactWrite(databaseClient, "", [
      new Dynatron("tableName1").put({ id: "uuid1" }).returnValues(),
      new Dynatron("tableName2").check({ id: "uuid2" }).if(eq("value", 7)),
      new Dynatron("tableName3").delete({ id: "uuid3" }),
      new Dynatron("tableName4").update({ id: "uuid4" }).assign({ value: 8 }),
    ]);
    expect(
      instance
        .returnConsumedCapacity()
        .clientRequestToken("token")
        .returnItemCollectionMetrics(),
    ).toBeInstanceOf(TransactWrite);
    expect(instance[BUILD]()).toEqual({
      TableName: "",
      ClientRequestToken: "token",
      ReturnConsumedCapacity: "TOTAL",
      ReturnItemCollectionMetrics: "SIZE",
    });
  });

  test("should return an instance of TransactWrite", async () => {
    DynamoDBClient.prototype.send = async () => {
      return {};
    };

    const instance = new TransactWrite(databaseClient, "", [
      new Dynatron("tableName1").put({ id: "uuid1" }).returnValues(),
      new Dynatron("tableName2").check({ id: "uuid2" }).if(eq("value", 7)),
      new Dynatron("tableName3").delete({ id: "uuid3" }),
      new Dynatron("tableName4").update({ id: "uuid4" }).assign({ value: 8 }),
    ]);
    expect(
      instance
        .returnConsumedCapacity()
        .clientRequestToken("token")
        .returnItemCollectionMetrics(),
    ).toBeInstanceOf(TransactWrite);
    expect(await instance.$()).toEqual({});
  });

  test("should return an instance of TransactWrite", async () => {
    DynamoDBClient.prototype.send = async () => {
      throw new Error("ECONN");
    };

    const instance = new TransactWrite(databaseClient, "tableName", []);
    try {
      await instance.$();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  test("should return an instance of TransactWrite", async () => {
    DynamoDBClient.prototype.send = async () => {
      throw new Error("Unknown");
    };

    const instance = new TransactWrite(databaseClient, "tableName", []);

    try {
      await instance.$();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});
