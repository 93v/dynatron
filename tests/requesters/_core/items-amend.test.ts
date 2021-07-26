import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { Request } from "../../../src/requesters/_core/items-request";
import { Amend } from "../../../src/requesters/_core/items-amend";
import { BUILD } from "../../../src/utils/misc-utils";

describe("Amend", () => {
  test("should return an instance of Request", () => {
    const instance = new Amend(new DynamoDBClient({}), "");
    expect(instance).toBeInstanceOf(Request);
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
