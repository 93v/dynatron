import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { TableList } from "../../../src/requesters/tables/table-list";
import { BUILD } from "../../../src/utils/misc-utils";

let databaseClient: DynamoDBClient;

beforeAll(() => {
  databaseClient = new DynamoDBClient({});
});

describe("Table List", () => {
  test("should return an instance of TableList", () => {
    const instance = new TableList(databaseClient);
    expect(instance).toBeInstanceOf(TableList);
    expect(instance[BUILD]()).toEqual({});
  });

  test("should return an instance of TableList", () => {
    const instance = new TableList(databaseClient);
    instance.limit(1);
    expect(instance).toBeInstanceOf(TableList);
    expect(instance[BUILD]()).toEqual({ Limit: 1 });
  });

  test("should return an instance of TableList", () => {
    const instance = new TableList(databaseClient);
    instance.start();
    expect(instance).toBeInstanceOf(TableList);
    expect(instance[BUILD]()).toEqual({});

    instance.start("startTableName");
    expect(instance).toBeInstanceOf(TableList);
    expect(instance[BUILD]()).toEqual({
      ExclusiveStartTableName: "startTableName",
    });
  });
});
