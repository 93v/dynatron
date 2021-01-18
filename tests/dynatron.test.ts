import { Dynatron } from "../src/dynatron";
import { Get } from "../src/requesters/items/1.1-get";
import { BatchGet } from "../src/requesters/1.2-batch-get";
import { Query } from "../src/requesters/items/1.3.1-query";
import { Scan } from "../src/requesters/items/1.3.2-scan";
import { Check } from "../src/requesters/items/2.1-check";
import { Delete } from "../src/requesters/items/2.1.1-delete";
import { Put } from "../src/requesters/items/2.1.2-put";
import { Update } from "../src/requesters/items/2.1.3-update";
import { BatchDelete } from "../src/requesters/2.2-batch-delete";
import { BatchPut } from "../src/requesters/2.3-batch-put";
import { TransactWrite } from "../src/requesters/2.4-transact-write";
import { TransactGet } from "../src/requesters/3-transact-get";
import { TableCreate } from "../src/requesters/tables/table-create";
import { TableDelete } from "../src/requesters/tables/table-delete";
import { TableDescribe } from "../src/requesters/tables/table-describe";
import { TableList } from "../src/requesters/tables/table-list";
import { TableTTLDescribe } from "../src/requesters/tables/table-ttl-describe";
import { TableTTLUpdate } from "../src/requesters/tables/table-ttl-update";
import { TableUpdate } from "../src/requesters/tables/table-update";

describe("Dynatron instance", () => {
  const dynatron = new Dynatron("");
  test("should be an instance of Dynatron", async () => {
    expect(dynatron).toBeInstanceOf(Dynatron);
  });
  test("should be an instance of BatchDelete", () => {
    expect(dynatron.batchDelete([])).toBeInstanceOf(BatchDelete);
  });
  test("should be an instance of BatchGet", () => {
    expect(dynatron.batchGet([])).toBeInstanceOf(BatchGet);
  });
  test("should be an instance of BatchPut", () => {
    expect(dynatron.batchPut([])).toBeInstanceOf(BatchPut);
  });
  test("should be an instance of Checker", () => {
    expect(dynatron.check({})).toBeInstanceOf(Check);
  });
  test("should be an instance of Delete", () => {
    expect(dynatron.delete({})).toBeInstanceOf(Delete);
  });
  test("should be an instance of Get", () => {
    expect(dynatron.get({ id: "1" })).toBeInstanceOf(Get);
  });
  test("should be an instance of Put", () => {
    expect(dynatron.put({})).toBeInstanceOf(Put);
  });
  test("should be an instance of Query", () => {
    expect(dynatron.query("id", "")).toBeInstanceOf(Query);
  });
  test("should be an instance of Scan", () => {
    expect(dynatron.scan()).toBeInstanceOf(Scan);
  });
  test("should be an instance of Updater", () => {
    expect(dynatron.update({})).toBeInstanceOf(Update);
  });
  test("should be an instance of TransactGet", () => {
    expect(dynatron.transactGet([])).toBeInstanceOf(TransactGet);
  });
  test("should be an instance of TransactWrite", () => {
    expect(dynatron.transactWrite([])).toBeInstanceOf(TransactWrite);
  });
  test("should be an instance of TableCreator", () => {
    expect(dynatron.Tables.create({} as any)).toBeInstanceOf(TableCreate);
  });
  test("should be an instance of TableDeleter", () => {
    expect(dynatron.Tables.delete()).toBeInstanceOf(TableDelete);
  });
  test("should be an instance of TableDescriber", () => {
    expect(dynatron.Tables.describe()).toBeInstanceOf(TableDescribe);
  });
  test("should be an instance of TableLister", () => {
    expect(dynatron.Tables.list()).toBeInstanceOf(TableList);
  });
  test("should be an instance of TableTTLDescriber", () => {
    expect(dynatron.Tables.describeTTL()).toBeInstanceOf(TableTTLDescribe);
  });
  test("should be an instance of TableTTLUpdater", () => {
    expect(dynatron.Tables.updateTTL({} as any)).toBeInstanceOf(TableTTLUpdate);
  });
  test("should be an instance of TableUpdater", () => {
    expect(dynatron.Tables.update({} as any)).toBeInstanceOf(TableUpdate);
  });
});
