import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { Amend } from "../../../src/requesters/_core/items-amend";
import { ItemRequest } from "../../../src/requesters/_core/items-request";
import { BUILD } from "../../../src/utils/misc-utils";

describe("Amend", () => {
  test("should return an instance of ItemRequest", () => {
    const instance = new Amend(new DynamoDBClient({}), "");
    expect(instance).toBeInstanceOf(ItemRequest);
  });

  test("should return an instance of Amend and correctly build", () => {
    const instance = new Amend(new DynamoDBClient({}), "");

    expect(instance.returnItemCollectionMetrics()).toBe(instance);
    expect(instance[BUILD]()).toEqual({
      ReturnConsumedCapacity: "INDEXES",
      TableName: "",
      ReturnItemCollectionMetrics: "SIZE",
    });
  });
});
