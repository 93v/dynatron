import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { Request } from "../../../src/requesters/items/0-request";
import { Amend } from "../../../src/requesters/items/2-amend";
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
      TableName: "",
      ReturnItemCollectionMetrics: "SIZE",
    });
  });
});
