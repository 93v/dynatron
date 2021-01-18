import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { Request } from "../src/requesters/items/0-request";
import { Amend } from "../src/requesters/items/2-amend";
import { BUILD } from "../src/utils/constants";
import { initializeDatabaseClient } from "../src/utils/database-client";

let databaseClient: DynamoDBClient;

beforeAll(() => {
  databaseClient = initializeDatabaseClient();
});

describe("Amend", () => {
  test("should be an instance of Request", () => {
    const instance = new Amend(databaseClient, "");
    expect(instance).toBeInstanceOf(Request);
  });

  test("should be an instance of Amend", () => {
    const instance = new Amend(databaseClient, "");
    expect(instance).toBeInstanceOf(Amend);
  });

  test("method call should return itself", () => {
    const instance = new Amend(databaseClient, "");
    expect(instance.returnItemCollectionMetrics()).toBe(instance);
  });

  test("should build with ReturnItemCollectionMetrics", () => {
    const instance = new Amend(databaseClient, "");
    instance.returnItemCollectionMetrics();

    expect(instance[BUILD]()).toMatchObject({
      ReturnItemCollectionMetrics: "SIZE",
    });
  });

  test("should build with ReturnItemCollectionMetrics", () => {
    const instance = new Amend(databaseClient, "");
    instance.returnItemCollectionMetrics("SIZE");

    expect(instance[BUILD]()).toMatchObject({
      ReturnItemCollectionMetrics: "SIZE",
    });
  });

  test("should build with ReturnItemCollectionMetrics", () => {
    const instance = new Amend(databaseClient, "");
    instance.returnItemCollectionMetrics("NONE");

    expect(instance[BUILD]()).toMatchObject({
      ReturnItemCollectionMetrics: "NONE",
    });
  });
});
