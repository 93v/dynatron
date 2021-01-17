import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { Requester } from "../src/requesters/0-requester";
import { Reader } from "../src/requesters/1-reader";
import { BUILD } from "../src/utils/constants";
import { initializeDatabaseClient } from "../src/utils/database-client";

let databaseClient: DynamoDBClient;

beforeAll(() => {
  databaseClient = initializeDatabaseClient();
});

describe("Reader", () => {
  test("should be an instance of Requester", () => {
    const instance = new Reader(databaseClient, "");
    expect(instance).toBeInstanceOf(Requester);
  });

  test("should be an instance of Reader", () => {
    const instance = new Reader(databaseClient, "");
    expect(instance).toBeInstanceOf(Reader);
  });

  test("method call should return itself", () => {
    const instance = new Reader(databaseClient, "");
    expect(instance.consistentRead()).toBe(instance);
    expect(instance.select("")).toBe(instance);
  });

  test("should build with ConsistentRead", () => {
    const instance = new Reader(databaseClient, "");
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
    const instance = new Reader(databaseClient, "");
    instance.consistentRead(false);

    expect(instance[BUILD]()).toMatchObject({});
  });

  test("should build with ProjectionExpressions", () => {
    const instance = new Reader(databaseClient, "");
    instance.select();

    expect(instance[BUILD]()).toMatchObject({});
  });

  test("should build with ProjectionExpressions", () => {
    const instance = new Reader(databaseClient, "");
    instance.select("id");

    expect(instance[BUILD]()).toMatchObject({ _ProjectionExpressions: ["id"] });
  });

  test("should build with ProjectionExpressions", () => {
    const instance = new Reader(databaseClient, "");
    instance.select("id");
    instance.select("name");

    expect(instance[BUILD]()).toMatchObject({
      _ProjectionExpressions: ["id", "name"],
    });
  });

  test("should build with ProjectionExpressions", () => {
    const instance = new Reader(databaseClient, "");
    instance.select(["id", "name"]);

    expect(instance[BUILD]()).toMatchObject({
      _ProjectionExpressions: ["id", "name"],
    });
  });

  test("should build with ProjectionExpressions", () => {
    const instance = new Reader(databaseClient, "");
    // eslint-disable-next-line unicorn/no-null
    instance.select("id", "name", undefined, null, "age");

    expect(instance[BUILD]()).toMatchObject({
      _ProjectionExpressions: ["id", "name", "age"],
    });
  });
});
