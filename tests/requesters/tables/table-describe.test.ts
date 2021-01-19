import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { TableDescribe } from "../../../src/requesters/tables/table-describe";
import { BUILD } from "../../../src/utils/misc-utils";

let databaseClient: DynamoDBClient;

beforeAll(() => {
  databaseClient = new DynamoDBClient({});
});

describe("Table Describe", () => {
  test("should return an instance of TableDescribe", () => {
    const instance = new TableDescribe(databaseClient, "tableName");
    expect(instance).toBeInstanceOf(TableDescribe);
    expect(instance[BUILD]()).toEqual({ TableName: "tableName" });
  });
});
