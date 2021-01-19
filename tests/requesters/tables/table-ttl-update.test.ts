import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { TableTTLUpdate } from "../../../src/requesters/tables/table-ttl-update";
import { BUILD } from "../../../src/utils/misc-utils";

const initialSend = DynamoDBClient.prototype.send;

let databaseClient: DynamoDBClient;

beforeAll(() => {
  databaseClient = new DynamoDBClient({ region: "local" });
});

afterAll(() => {
  DynamoDBClient.prototype.send = initialSend;
});

describe("Table TTL Update", () => {
  test("should return an instance of TableTTLUpdate", () => {
    const instance = new TableTTLUpdate(databaseClient, {} as any);
    expect(instance).toBeInstanceOf(TableTTLUpdate);
    expect(instance[BUILD]()).toEqual({});
  });

  test("should return an instance of TableTTLUpdate", async () => {
    DynamoDBClient.prototype.send = async () => {
      return {};
    };

    const instance = new TableTTLUpdate(databaseClient, {} as any);
    expect(instance).toBeInstanceOf(TableTTLUpdate);

    expect(await instance.$()).toBeUndefined();
  });

  test("should return an instance of TableTTLUpdate", async () => {
    DynamoDBClient.prototype.send = async () => {
      throw new Error("ECONN");
    };

    const instance = new TableTTLUpdate(databaseClient, {} as any);
    expect(instance).toBeInstanceOf(TableTTLUpdate);

    try {
      await instance.$();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  test("should return an instance of TableTTLUpdate", async () => {
    DynamoDBClient.prototype.send = async () => {
      throw new Error("Unknown");
    };

    const instance = new TableTTLUpdate(databaseClient, {} as any);
    expect(instance).toBeInstanceOf(TableTTLUpdate);

    try {
      await instance.$();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});
