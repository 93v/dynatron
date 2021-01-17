import { Dynatron } from "../src/dynatron";
import { Getter } from "../src/requesters/1.1-getter";
import { BatchGetter } from "../src/requesters/1.2-batch-getter";
import { Querier } from "../src/requesters/1.3.1-querier";
import { Scanner } from "../src/requesters/1.3.2-scanner";
import { ConditionChecker } from "../src/requesters/2.1-condition-checker";
import { Deleter } from "../src/requesters/2.1.1-deleter";
import { Putter } from "../src/requesters/2.1.2-putter";
import { Updater } from "../src/requesters/2.1.3-updater";
import { BatchDeleter } from "../src/requesters/2.2-batch-deleter";
import { BatchPutter } from "../src/requesters/2.3-batch-putter";
import { TransactWriter } from "../src/requesters/2.4-transact-writer";
import { TransactGetter } from "../src/requesters/3-transact-getter";
import { TableCreator } from "../src/requesters/tables/table-creator";
import { TableDeleter } from "../src/requesters/tables/table-deleter";
import { TableDescriber } from "../src/requesters/tables/table-describer";
import { TableLister } from "../src/requesters/tables/table-lister";
import { TableTTLDescriber } from "../src/requesters/tables/table-ttl-describer";
import { TableTTLUpdater } from "../src/requesters/tables/table-ttl-updater";
import { TableUpdater } from "../src/requesters/tables/table-updater";

describe("Dynatron instance", () => {
  const dynatron = new Dynatron("");
  test("should be an instance of Dynatron", async () => {
    expect(dynatron).toBeInstanceOf(Dynatron);
  });
  test("should be an instance of BatchDeleter", () => {
    expect(dynatron.batchDelete()).toBeInstanceOf(BatchDeleter);
  });
  test("should be an instance of BatchGetter", () => {
    expect(dynatron.batchGet()).toBeInstanceOf(BatchGetter);
  });
  test("should be an instance of BatchPutter", () => {
    expect(dynatron.batchPut()).toBeInstanceOf(BatchPutter);
  });
  test("should be an instance of Checker", () => {
    expect(dynatron.check()).toBeInstanceOf(ConditionChecker);
  });
  test("should be an instance of Deleter", () => {
    expect(dynatron.delete()).toBeInstanceOf(Deleter);
  });
  test("should be an instance of Getter", () => {
    expect(dynatron.get({ id: "1" })).toBeInstanceOf(Getter);
  });
  test("should be an instance of Putter", () => {
    expect(dynatron.put()).toBeInstanceOf(Putter);
  });
  test("should be an instance of Querier", () => {
    expect(dynatron.query()).toBeInstanceOf(Querier);
  });
  test("should be an instance of Scanner", () => {
    expect(dynatron.scan()).toBeInstanceOf(Scanner);
  });
  test("should be an instance of Updater", () => {
    expect(dynatron.update()).toBeInstanceOf(Updater);
  });
  test("should be an instance of TransactGetter", () => {
    expect(dynatron.transactGet()).toBeInstanceOf(TransactGetter);
  });
  test("should be an instance of TransactWriter", () => {
    expect(dynatron.transactWrite()).toBeInstanceOf(TransactWriter);
  });
  test("should be an instance of TableCreator", () => {
    expect(dynatron.Tables.create({} as any)).toBeInstanceOf(TableCreator);
  });
  test("should be an instance of TableDeleter", () => {
    expect(dynatron.Tables.delete()).toBeInstanceOf(TableDeleter);
  });
  test("should be an instance of TableDescriber", () => {
    expect(dynatron.Tables.describe()).toBeInstanceOf(TableDescriber);
  });
  test("should be an instance of TableLister", () => {
    expect(dynatron.Tables.list()).toBeInstanceOf(TableLister);
  });
  test("should be an instance of TableTTLDescriber", () => {
    expect(dynatron.Tables.describeTTL()).toBeInstanceOf(TableTTLDescriber);
  });
  test("should be an instance of TableTTLUpdater", () => {
    expect(dynatron.Tables.updateTTL({} as any)).toBeInstanceOf(
      TableTTLUpdater,
    );
  });
  test("should be an instance of TableUpdater", () => {
    expect(dynatron.Tables.update({} as any)).toBeInstanceOf(TableUpdater);
  });
});
