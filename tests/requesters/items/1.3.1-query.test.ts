import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { equals } from "../../../src/condition-expression-builders";

import { Query } from "../../../src/requesters/items/1.3.1-query";
import { BUILD } from "../../../src/utils/misc-utils";

const initialSend = DynamoDBClient.prototype.send;

let databaseClient: DynamoDBClient;

beforeAll(() => {
  databaseClient = new DynamoDBClient({ region: "local" });
});

afterAll(() => {
  DynamoDBClient.prototype.send = initialSend;
});

describe("Query", () => {
  test("should return an instance of Query", () => {
    const instance = new Query(databaseClient, "", equals("id", "uuid1"));
    expect(instance).toBeInstanceOf(Query);
  });

  test("should return an instance of Query", () => {
    const instance = new Query(databaseClient, "", equals("id", "uuid1"));

    expect(instance[BUILD]()).toEqual({
      TableName: "",
      _KeyConditionExpression: {
        kind: "AND",
        conditions: [{ kind: "=", attributePath: "id", value: "uuid1" }],
      },
    });

    // eslint-disable-next-line unicorn/no-useless-undefined
    instance.having(undefined);
    expect(instance[BUILD]()).toEqual({
      TableName: "",
      _KeyConditionExpression: {
        kind: "AND",
        conditions: [{ kind: "=", attributePath: "id", value: "uuid1" }],
      },
    });

    instance.having(equals("id", "uuid2"));
    expect(instance[BUILD]()).toEqual({
      TableName: "",
      _KeyConditionExpression: {
        kind: "AND",
        conditions: [
          { kind: "=", attributePath: "id", value: "uuid1" },
          { kind: "=", attributePath: "id", value: "uuid2" },
        ],
      },
    });
  });

  test("should return an instance of Query", () => {
    const instance = new Query(databaseClient, "", equals("id", "uuid1"));

    instance.sort("ASC");
    expect(instance[BUILD]()).toEqual({
      TableName: "",
      _KeyConditionExpression: {
        kind: "AND",
        conditions: [{ kind: "=", attributePath: "id", value: "uuid1" }],
      },
    });

    instance.sort("DSC");
    expect(instance[BUILD]()).toEqual({
      TableName: "",
      ScanIndexForward: false,
      _KeyConditionExpression: {
        kind: "AND",
        conditions: [{ kind: "=", attributePath: "id", value: "uuid1" }],
      },
    });
  });

  test("should return an instance of Query", async () => {
    DynamoDBClient.prototype.send = async () => {
      return {};
    };

    const instance = new Query(
      databaseClient,
      "tableName",
      equals("id", "uuid1"),
    );
    expect(await instance.$()).toEqual(undefined);
  });

  test("should return an instance of Query", async () => {
    DynamoDBClient.prototype.send = async () => {
      return {
        Items: [{ id: { S: "uuid1" } }, { id: { S: "uuid2" } }],
      };
    };

    const instance = new Query(
      databaseClient,
      "tableName",
      equals("id", "uuid1"),
    );
    expect(await instance.$()).toEqual([{ id: "uuid1" }, { id: "uuid2" }]);
    expect(await instance.indexName("index").consistentRead(true).$()).toEqual([
      { id: "uuid1" },
      { id: "uuid2" },
    ]);
  });

  test("should return an instance of Query", async () => {
    DynamoDBClient.prototype.send = async () => {
      return {
        Items: [{ id: { S: "uuid1" } }, { id: { S: "uuid2" } }],
      };
    };

    const instance = new Query(
      databaseClient,
      "tableName",
      equals("id", "uuid1"),
    );
    expect(await instance.$()).toEqual([{ id: "uuid1" }, { id: "uuid2" }]);
    expect(await instance.$(true)).toEqual({
      Items: [{ id: { S: "uuid1" } }, { id: { S: "uuid2" } }],
    });
  });

  test("should return an instance of Query", async () => {
    DynamoDBClient.prototype.send = async () => {
      return {
        Items: [{ id: { S: "uuid1" } }, { id: { S: "uuid2" } }],
      };
    };

    const instance = new Query(
      databaseClient,
      "tableName",
      equals("id", "uuid1"),
    );
    expect(await instance.limit(1).$()).toEqual([{ id: "uuid1" }]);
  });

  test("should return an instance of Query", async () => {
    DynamoDBClient.prototype.send = async () => {
      return {
        LastEvaluatedKey: { id: { S: "uuid1" } },
        Count: 1,
        ScannedCount: 1,
        ConsumedCapacity: { CapacityUnits: 1 },
        Items: [{ id: { S: "uuid1" } }, { id: { S: "uuid2" } }],
      };
    };

    const instance = new Query(
      databaseClient,
      "tableName",
      equals("id", "uuid1"),
    );
    expect(await instance.limit(1).$(true, true)).toEqual({
      ConsumedCapacity: { CapacityUnits: 1 },
      Count: 1,
      Items: [{ id: { S: "uuid1" } }],
      LastEvaluatedKey: { id: { S: "uuid1" } },
      ScannedCount: 1,
    });
  });

  test("should return an instance of Query", async () => {
    DynamoDBClient.prototype.send = async () => {
      return {
        LastEvaluatedKey: { id: { S: "uuid1" } },
        Count: 1,
        ScannedCount: 1,
        ConsumedCapacity: { CapacityUnits: 1 },
        Items: [{ id: { S: "uuid1" } }, { id: { S: "uuid2" } }],
      };
    };

    const instance = new Query(
      databaseClient,
      "tableName",
      equals("id", "uuid1"),
    );
    expect(await instance.limit(1).$(true, false)).toEqual({
      ConsumedCapacity: { CapacityUnits: 1 },
      Count: 1,
      Items: [{ id: { S: "uuid1" } }],
      ScannedCount: 1,
    });
  });

  test("should return an instance of Query", async () => {
    DynamoDBClient.prototype.send = async () => {
      throw new Error("ECONN");
    };

    const instance = new Query(
      databaseClient,
      "tableName",
      equals("id", "uuid1"),
    );
    try {
      await instance.$();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  test("should return an instance of Query", async () => {
    DynamoDBClient.prototype.send = async () => {
      throw new Error("Unknown");
    };

    const instance = new Query(
      databaseClient,
      "tableName",
      equals("id", "uuid1"),
    );

    try {
      await instance.$();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});
