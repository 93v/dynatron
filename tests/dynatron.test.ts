import { Dynatron } from "../src/dynatron";
import { DynatronClient } from "../src/dynatron-client";
import { OptimizedRequestHandler } from "../src/optimized-request-handler";
import { Get } from "../src/requesters/items/1.1-get";
import { BatchGet } from "../src/requesters/items/1.2-batch-get";
import { Query } from "../src/requesters/items/1.3.1-query";
import { Scan } from "../src/requesters/items/1.3.2-scan";
import { Check } from "../src/requesters/items/2.1-check";
import { Delete } from "../src/requesters/items/2.1.1-delete";
import { Put } from "../src/requesters/items/2.1.2-put";
import { Update } from "../src/requesters/items/2.1.3-update";
import { BatchWrite } from "../src/requesters/items/2.2-batch-write";
import { TransactWrite } from "../src/requesters/items/2.3-transact-write";
import { TransactGet } from "../src/requesters/items/3-transact-get";
import { TableCreate } from "../src/requesters/tables/table-create";
import { TableDelete } from "../src/requesters/tables/table-delete";
import { TableDescribe } from "../src/requesters/tables/table-describe";
import { TableList } from "../src/requesters/tables/table-list";
import { TableTTLDescribe } from "../src/requesters/tables/table-ttl-describe";
import { TableTTLUpdate } from "../src/requesters/tables/table-ttl-update";
import { TableUpdate } from "../src/requesters/tables/table-update";

describe("Database Client", () => {
  test("should return an instance of Dynatron", () => {
    const dynatron = new Dynatron(
      new DynatronClient({}, new OptimizedRequestHandler()),
    );
    expect(dynatron).toBeInstanceOf(Dynatron);
  });

  test("should return an instance of Dynatron", () => {
    const dynatron = new Dynatron(
      new DynatronClient({}, new OptimizedRequestHandler(100)),
    );
    expect(dynatron).toBeInstanceOf(Dynatron);
  });

  test("should return an instance of Dynatron", () => {
    const dynatron = new Dynatron(
      new DynatronClient({ region: "local" }, new OptimizedRequestHandler()),
    );
    expect(dynatron).toBeInstanceOf(Dynatron);
  });

  test("should return an instance of Dynatron", () => {
    const dynatron = new Dynatron(
      new DynatronClient({ region: "local" }, new OptimizedRequestHandler(100)),
    );
    expect(dynatron).toBeInstanceOf(Dynatron);
  });

  test("should return an instance of Dynatron", () => {
    const dynatron = new Dynatron(
      new DynatronClient(
        { region: "eu-central-1" },
        new OptimizedRequestHandler(100),
      ),
      "newInstance",
    );
    expect(dynatron).toBeInstanceOf(Dynatron);
  });

  test("should return an instance of Dynatron", () => {
    const dynatron = new Dynatron(
      new DynatronClient({ region: "eu-central-1" }),
      "newInstance",
    );
    expect(dynatron).toBeInstanceOf(Dynatron);
  });

  test("should return an instance of Dynatron", () => {
    const dynatron = new Dynatron(
      new DynatronClient({ region: "local" }),
      "newInstance2",
    );
    expect(dynatron).toBeInstanceOf(Dynatron);
  });
});

describe("Dynatron instance", () => {
  const dynatron = new Dynatron(
    new DynatronClient({}, new OptimizedRequestHandler()),
  );
  test("should be an instance of Dynatron", async () => {
    expect(dynatron).toBeInstanceOf(Dynatron);
  });
  test("should be an instance of BatchWrite", () => {
    expect(dynatron.tableName("").batchDelete([])).toBeInstanceOf(BatchWrite);
  });
  test("should be an instance of BatchGet", () => {
    expect(dynatron.tableName("").batchGet([])).toBeInstanceOf(BatchGet);
  });
  test("should be an instance of BatchWrite", () => {
    expect(dynatron.tableName("").batchPut([])).toBeInstanceOf(BatchWrite);
  });
  test("should be an instance of Check", () => {
    expect(dynatron.tableName("").check({ id: "" })).toBeInstanceOf(Check);
  });
  test("should be an instance of Delete", () => {
    expect(dynatron.tableName("").delete({ id: "" })).toBeInstanceOf(Delete);
  });
  test("should be an instance of Get", () => {
    expect(dynatron.tableName("").get({ id: "1" })).toBeInstanceOf(Get);
  });
  test("should be an instance of Put", () => {
    expect(dynatron.tableName("").put({})).toBeInstanceOf(Put);
  });
  test("should be an instance of Query", () => {
    expect(dynatron.tableName("").query("id", "")).toBeInstanceOf(Query);
  });
  test("should be an instance of Scan", () => {
    expect(dynatron.tableName("").scan()).toBeInstanceOf(Scan);
  });
  test("should be an instance of Update", () => {
    expect(dynatron.tableName("").update({ id: "" })).toBeInstanceOf(Update);
  });
  test("should be an instance of TransactGet", () => {
    expect(dynatron.tableName("").transactGet([])).toBeInstanceOf(TransactGet);
  });
  test("should be an instance of TransactWrite", () => {
    expect(dynatron.tableName("").transactWrite([])).toBeInstanceOf(
      TransactWrite,
    );
  });
  test("should be an instance of TableCreator", () => {
    expect(
      dynatron.Tables.create({
        AttributeDefinitions: [],
        KeySchema: [],
        TableName: "tableName",
      }),
    ).toBeInstanceOf(TableCreate);
  });
  test("should be an instance of TableDelete", () => {
    expect(dynatron.Tables.delete("")).toBeInstanceOf(TableDelete);
  });
  test("should be an instance of TableDescribe", () => {
    expect(dynatron.Tables.describe("")).toBeInstanceOf(TableDescribe);
  });
  test("should be an instance of TableList", () => {
    expect(dynatron.Tables.list()).toBeInstanceOf(TableList);
  });
  test("should be an instance of TableTTLDescribe", () => {
    expect(dynatron.Tables.describeTTL("")).toBeInstanceOf(TableTTLDescribe);
  });
  test("should be an instance of TableTTLUpdate", () => {
    expect(
      dynatron.Tables.updateTTL({
        TableName: "tableName",
        TimeToLiveSpecification: {
          AttributeName: "name",
          Enabled: true,
        },
      }),
    ).toBeInstanceOf(TableTTLUpdate);
  });
  test("should be an instance of TableUpdate", () => {
    expect(
      dynatron.Tables.update({
        TableName: "tableName",
      }),
    ).toBeInstanceOf(TableUpdate);
  });
});
