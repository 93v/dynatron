import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { TableDelete } from "../../../src/requesters/tables/table-delete";
import { BUILD } from "../../../src/utils/misc-utils";

let databaseClient: DynamoDBClient;

beforeAll(() => {
  databaseClient = new DynamoDBClient({});
});

describe("Table Delete", () => {
  test("should return an instance of TableDelete", () => {
    const instance = new TableDelete(databaseClient, "tableName");
    expect(instance).toBeInstanceOf(TableDelete);
    expect(instance[BUILD]()).toEqual({ TableName: "tableName" });
  });
});
