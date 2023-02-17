import { Dynatron, DynatronClient } from "../src";
import { Check } from "../src/requesters/_core/items-check";
import { BatchGet } from "../src/requesters/batch/batch-get";
import { BatchWrite } from "../src/requesters/batch/batch-write";
import { Delete } from "../src/requesters/items/items-delete";
import { Get } from "../src/requesters/items/items-get";
import { Put } from "../src/requesters/items/items-put";
import { Query } from "../src/requesters/items/items-query";
import { Scan } from "../src/requesters/items/items-scan";
import { Update } from "../src/requesters/items/items-update";
import { TableCreate } from "../src/requesters/tables/tables-create";
import { TableDelete } from "../src/requesters/tables/tables-delete";
import { TableDescribe } from "../src/requesters/tables/tables-describe";
import { TableList } from "../src/requesters/tables/tables-list";
import { TableTTLDescribe } from "../src/requesters/tables/tables-ttl-describe";
import { TableTTLUpdate } from "../src/requesters/tables/tables-ttl-update";
import { TableUpdate } from "../src/requesters/tables/tables-update";
import { TransactGet } from "../src/requesters/transact/transact-get";
import { TransactWrite } from "../src/requesters/transact/transact-write";

describe("Database Client", () => {
  test("should return an instance of Dynatron", () => {
    const client = new DynatronClient({});
    const dynatron = new Dynatron(client);
    expect(dynatron).toBeInstanceOf(Dynatron);
  });

  test("should return an instance of Dynatron", () => {
    const client = new DynatronClient({ timeout: 100 });
    const dynatron = new Dynatron(client);
    expect(dynatron).toBeInstanceOf(Dynatron);
  });

  test("should return an instance of Dynatron", () => {
    const client = new DynatronClient({ timeout: undefined });
    const dynatron = new Dynatron(client);
    expect(dynatron).toBeInstanceOf(Dynatron);
  });

  test("should return an instance of Dynatron", () => {
    const client = new DynatronClient({
      region: "local",
      endpoint: "http://127.0.0.1:8000",
    });
    const dynatron = new Dynatron(client);
    expect(dynatron).toBeInstanceOf(Dynatron);
  });

  test("should return an instance of Dynatron", () => {
    const client = new DynatronClient({
      region: "local",
      endpoint: "http://127.0.0.1:8000",
      timeout: 100,
    });
    const dynatron = new Dynatron(client);
    expect(dynatron).toBeInstanceOf(Dynatron);
  });
});

describe("Dynatron instance", () => {
  const client = new DynatronClient({});
  const dynatron = new Dynatron(client);

  test("should be an instance of Dynatron", async () => {
    expect(dynatron).toBeInstanceOf(Dynatron);
  });
  test("should be an instance of BatchWrite", () => {
    expect(dynatron.Batch.write([])).toBeInstanceOf(BatchWrite);
  });
  test("should be an instance of BatchGet", () => {
    expect(dynatron.Batch.get([])).toBeInstanceOf(BatchGet);
  });
  test("should be an instance of Check", () => {
    expect(dynatron.Items("").check({ id: "" })).toBeInstanceOf(Check);
  });
  test("should be an instance of Delete", () => {
    expect(dynatron.Items("").delete({ id: "" })).toBeInstanceOf(Delete);
  });
  test("should be an instance of Get", () => {
    expect(dynatron.Items("").get({ id: "1" })).toBeInstanceOf(Get);
  });
  test("should be an instance of Put", () => {
    expect(dynatron.Items("").put({})).toBeInstanceOf(Put);
  });
  test("should be an instance of Query", () => {
    expect(dynatron.Items("").query("id", "")).toBeInstanceOf(Query);
  });
  test("should be an instance of Scan", () => {
    expect(dynatron.Items("").scan()).toBeInstanceOf(Scan);
  });
  test("should be an instance of Update", () => {
    expect(dynatron.Items("").update({ id: "" })).toBeInstanceOf(Update);
  });
  test("should be an instance of TransactGet", () => {
    expect(dynatron.Transact.get([])).toBeInstanceOf(TransactGet);
  });
  test("should be an instance of TransactWrite", () => {
    expect(dynatron.Transact.write([])).toBeInstanceOf(TransactWrite);
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
