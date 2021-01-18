import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { Request } from "../src/requesters/0-request";
import { Fetch } from "../src/requesters/1-fetch";
import { BUILD } from "../src/utils/constants";
import { initializeDatabaseClient } from "../src/utils/database-client";

let databaseClient: DynamoDBClient;

beforeAll(() => {
  databaseClient = initializeDatabaseClient();
});

describe("Fetch", () => {
  test("should be an instance of Request", () => {
    const instance = new Fetch(databaseClient, "");
    expect(instance).toBeInstanceOf(Request);
  });

  test("should be an instance of Fetch", () => {
    const instance = new Fetch(databaseClient, "");
    expect(instance).toBeInstanceOf(Fetch);
  });

  test("method call should return itself", () => {
    const instance = new Fetch(databaseClient, "");
    expect(instance.consistentRead()).toBe(instance);
    expect(instance.select("")).toBe(instance);
  });

  test("should build with ConsistentRead", () => {
    const instance = new Fetch(databaseClient, "");
    instance.consistentRead();

    expect(instance[BUILD]()).toMatchObject({
      ConsistentRead: true,
    });

    instance.consistentRead(true);

    expect(instance[BUILD]()).toMatchObject({
      ConsistentRead: true,
    });
  });

  test("should build without ConsistentRead", () => {
    const instance = new Fetch(databaseClient, "");
    instance.consistentRead(false);

    expect(instance[BUILD]()).toMatchObject({});
  });

  test("should build with ProjectionExpressions", () => {
    const instance = new Fetch(databaseClient, "");
    instance.select();

    expect(instance[BUILD]()).toMatchObject({});
  });

  test("should build with ProjectionExpressions", () => {
    const instance = new Fetch(databaseClient, "");
    instance.select("id");

    expect(instance[BUILD]()).toMatchObject({ _ProjectionExpressions: ["id"] });
  });

  test("should build with ProjectionExpressions", () => {
    const instance = new Fetch(databaseClient, "");
    instance.select("id");
    instance.select("name");

    expect(instance[BUILD]()).toMatchObject({
      _ProjectionExpressions: ["id", "name"],
    });
  });

  test("should build with ProjectionExpressions", () => {
    const instance = new Fetch(databaseClient, "");
    instance.select(["id", "name"]);

    expect(instance[BUILD]()).toMatchObject({
      _ProjectionExpressions: ["id", "name"],
    });
  });

  test("should build with ProjectionExpressions", () => {
    const instance = new Fetch(databaseClient, "");
    instance.select("id", "name", undefined, "age");

    expect(instance[BUILD]()).toMatchObject({
      _ProjectionExpressions: ["id", "name", "age"],
    });
  });
});
