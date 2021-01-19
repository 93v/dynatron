import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { TableCreate } from "../../../src/requesters/tables/table-create";
import { BUILD } from "../../../src/utils/misc-utils";

let databaseClient: DynamoDBClient;

beforeAll(() => {
  databaseClient = new DynamoDBClient({});
});

describe("Table Create", () => {
  test("should return an instance of TableCreate", () => {
    const instance = new TableCreate(databaseClient, {} as any);
    expect(instance).toBeInstanceOf(TableCreate);
    expect(instance[BUILD]()).toEqual({});
  });
});
