import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { Request } from "../../../src/requesters/_core/items-request";
import { BUILD } from "../../../src/utils/misc-utils";

describe("Request", () => {
  test("should throw on negative relax ratio", () => {
    const instance = new Request(new DynamoDBClient({}), "");

    expect(() => instance.relaxLatencies(-1)).toThrow(
      "The ratio must be positive",
    );
  });

  test("should build to an expected object", () => {
    const instance = new Request(new DynamoDBClient({}), "");

    expect(instance.returnConsumedCapacity().relaxLatencies()).toBe(instance);
    expect(instance[BUILD]()).toEqual({
      TableName: "",
      ReturnConsumedCapacity: "TOTAL",
    });
  });
});
