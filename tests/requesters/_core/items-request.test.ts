import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { ItemRequest } from "../../../src/requesters/_core/items-request";
import { BUILD } from "../../../src/utils/misc-utils";

describe("ItemRequest", () => {
  test("should default to 1 on negative relax ratio", () => {
    const instance = new ItemRequest(new DynamoDBClient({}), "");

    expect(instance.relaxLatencies(-1)).toHaveProperty("patienceRatio", 1);
  });

  test("should build to an expected object", () => {
    const instance = new ItemRequest(new DynamoDBClient({}), "");

    expect(instance.relaxLatencies()).toBe(instance);
    expect(instance[BUILD]()).toEqual({
      TableName: "",
      ReturnConsumedCapacity: "INDEXES",
    });
  });
});
