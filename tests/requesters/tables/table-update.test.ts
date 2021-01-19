import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { TableUpdate } from "../../../src/requesters/tables/table-update";
import { BUILD } from "../../../src/utils/misc-utils";

let databaseClient: DynamoDBClient;

beforeAll(() => {
  databaseClient = new DynamoDBClient({});
});

describe("Table Update", () => {
  test("should return an instance of TableUpdate", () => {
    const instance = new TableUpdate(databaseClient, {} as any);
    expect(instance).toBeInstanceOf(TableUpdate);
    expect(instance[BUILD]()).toEqual({});
  });
});
