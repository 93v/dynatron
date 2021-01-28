import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import nock from "nock";

import { TableRequest } from "../../../src/requesters/tables/0-table-request";
import { TableTTLUpdate } from "../../../src/requesters/tables/table-ttl-update";

afterEach(() => {
  nock.abortPendingRequests();
  nock.cleanAll();
});

describe("Table TTL Update", () => {
  test("should return an instance of TableRequest", () => {
    const instance = new TableTTLUpdate(
      new DynamoDBClient({ region: "local" }),
      {
        TableName: "tableName",
        TimeToLiveSpecification: {
          AttributeName: "name",
          Enabled: true,
        },
      },
    );
    expect(instance).toBeInstanceOf(TableRequest);
  });

  test("should return a response with the specification", async () => {
    nock("https://localhost:8000")
      .post("/")
      .reply(200, { TimeToLiveSpecification: {} });

    const instance = new TableTTLUpdate(
      new DynamoDBClient({ region: "local" }),
      {
        TableName: "tableName",
        TimeToLiveSpecification: {
          AttributeName: "name",
          Enabled: true,
        },
      },
    );
    expect(await instance.$()).toEqual({});
  });

  test("should retry on retryable error", async () => {
    const scope = nock("https://localhost:8000")
      .persist(true)
      .post("/")
      .replyWithError("ECONN: Connection error");

    const instance = new TableTTLUpdate(
      new DynamoDBClient({ region: "local" }),
      {
        TableName: "tableName",
        TimeToLiveSpecification: {
          AttributeName: "name",
          Enabled: true,
        },
      },
    );

    try {
      await instance.$();
    } catch (error) {
      expect(error).toBeDefined();
    }
    scope.persist(false);
  });

  test("should fail on non-retryable error", async () => {
    const scope = nock("https://localhost:8000")
      .persist(true)
      .post("/")
      .replyWithError("Unknown");

    const instance = new TableTTLUpdate(
      new DynamoDBClient({ region: "local" }),
      {
        TableName: "tableName",
        TimeToLiveSpecification: {
          AttributeName: "name",
          Enabled: true,
        },
      },
    );

    try {
      await instance.$();
    } catch (error) {
      expect(error).toBeDefined();
    }
    scope.persist(false);
  });
});
