import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { TableTTLDescribe } from "../../../src/requesters/tables/table-ttl-describe";
import { BUILD } from "../../../src/utils/misc-utils";

let databaseClient: DynamoDBClient;

beforeAll(() => {
  databaseClient = new DynamoDBClient({});
});

describe("Table TTL Describe", () => {
  test("should return an instance of TableTTLDescribe", () => {
    const instance = new TableTTLDescribe(databaseClient, "tableName");
    expect(instance).toBeInstanceOf(TableTTLDescribe);
    expect(instance[BUILD]()).toEqual({ TableName: "tableName" });
  });
});
