import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { TableTTLUpdate } from "../../../src/requesters/tables/table-ttl-update";
import { BUILD } from "../../../src/utils/misc-utils";

let databaseClient: DynamoDBClient;

beforeAll(() => {
  databaseClient = new DynamoDBClient({});
});

describe("Table TTLUpdate", () => {
  test("should return an instance of TableTTLUpdate", () => {
    const instance = new TableTTLUpdate(databaseClient, {} as any);
    expect(instance).toBeInstanceOf(TableTTLUpdate);
    expect(instance[BUILD]()).toEqual({});
  });
});
