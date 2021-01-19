import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { Request } from "../../../src/requesters/items/0-request";
import { BUILD } from "../../../src/utils/misc-utils";

let databaseClient: DynamoDBClient;

beforeAll(() => {
  databaseClient = new DynamoDBClient({});
});

describe("Request", () => {
  test("should return an instance of Request", () => {
    const instance = new Request(databaseClient, "");
    expect(instance).toBeInstanceOf(Request);
  });

  test("should return an instance of Request", () => {
    const instance = new Request(databaseClient, "");

    expect(instance.returnConsumedCapacity()).toBe(instance);
    expect(instance[BUILD]()).toEqual({
      TableName: "",
      ReturnConsumedCapacity: "TOTAL",
    });
  });

  test("should return an instance of Request", () => {
    const instance = new Request(databaseClient, "");

    expect(instance.relaxLatencies()).toBe(instance);
  });

  test("should throw on negative relax ratio", () => {
    const instance = new Request(databaseClient, "");

    expect(() => instance.relaxLatencies(-1)).toThrow(
      "The ratio must be positive",
    );
  });

  test("should build", () => {
    const instance = new Request(databaseClient, "");

    expect(instance[BUILD]()).toEqual({ TableName: "" });
  });
});
