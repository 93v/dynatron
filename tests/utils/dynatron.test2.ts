// import { Dynatron } from "../../src/dynatron";
// import { BatchDeleter } from "../../src/requesters/items/batch-deleter";
// import { BatchGetter } from "../../src/requesters/items/batch-getter";
// import { BatchPutter } from "../../src/requesters/items/batch-putter";
// import { Checker } from "../../src/requesters/items/checker";
// import { Deleter } from "../../src/requesters/items/deleter";
// import { Getter } from "../../src/requesters/items/getter";
// import { Putter } from "../../src/requesters/items/putter";
// import { Querier } from "../../src/requesters/items/querier";
// import { Scanner } from "../../src/requesters/items/scanner";
// import { TransactGetter } from "../../src/requesters/items/transact-getter";
// import { Updater } from "../../src/requesters/items/updater";
// import { TableCreator } from "../../src/requesters/tables/table-creator";
// import { TableDeleter } from "../../src/requesters/tables/table-deleter";
// import { TableDescriber } from "../../src/requesters/tables/table-describer";
// import { TableLister } from "../../src/requesters/tables/table-lister";
// import { TableTTLDescriber } from "../../src/requesters/tables/table-ttl-describer";
// import { TableTTLUpdater } from "../../src/requesters/tables/table-ttl-updater";
// import { TableUpdater } from "../../src/requesters/tables/table-updater";

describe("", () => {
  test("", () => {
    expect(1 + 1).toBe(2);
  });
});

// describe("Dynatron instance", () => {
//   const dynatron = new Dynatron("");
//   test("should be an instance of Dynatron", async () => {
//     expect(dynatron).toBeInstanceOf(Dynatron);
//   });
//   test("should be an instance of BatchDeleter", () => {
//     expect(dynatron.batchDelete([])).toBeInstanceOf(BatchDeleter);
//   });
//   test("should be an instance of BatchGetter", () => {
//     expect(dynatron.batchGet()).toBeInstanceOf(BatchGetter);
//   });
//   test("should be an instance of BatchPutter", () => {
//     expect(dynatron.batchPut()).toBeInstanceOf(BatchPutter);
//   });
//   test("should be an instance of Checker", () => {
//     expect(dynatron.check()).toBeInstanceOf(Checker);
//   });
//   test("should be an instance of Deleter", () => {
//     expect(dynatron.delete()).toBeInstanceOf(Deleter);
//   });
//   test("should be an instance of Getter", () => {
//     expect(dynatron.get({ id: "" })).toBeInstanceOf(Getter);
//   });
//   test("should be an instance of Putter", () => {
//     expect(dynatron.put()).toBeInstanceOf(Putter);
//   });
//   test("should be an instance of Querier", () => {
//     expect(dynatron.query()).toBeInstanceOf(Querier);
//   });
//   test("should be an instance of Scanner", () => {
//     expect(dynatron.scan()).toBeInstanceOf(Scanner);
//   });
//   test("should be an instance of Updater", () => {
//     expect(dynatron.update()).toBeInstanceOf(Updater);
//   });
//   test("should be an instance of TransactGetter", () => {
//     expect(dynatron.transactGet()).toBeInstanceOf(TransactGetter);
//   });
//   test("should be an instance of TableCreator", () => {
//     expect(dynatron.Tables.create({} as any)).toBeInstanceOf(TableCreator);
//   });
//   test("should be an instance of TableDeleter", () => {
//     expect(dynatron.Tables.delete()).toBeInstanceOf(TableDeleter);
//   });
//   test("should be an instance of TableDescriber", () => {
//     expect(dynatron.Tables.describe()).toBeInstanceOf(TableDescriber);
//   });
//   test("should be an instance of TableLister", () => {
//     expect(dynatron.Tables.list()).toBeInstanceOf(TableLister);
//   });
//   test("should be an instance of TableTTLDescriber", () => {
//     expect(dynatron.Tables.describeTTL()).toBeInstanceOf(TableTTLDescriber);
//   });
//   test("should be an instance of TableTTLUpdater", () => {
//     expect(dynatron.Tables.updateTTL({} as any)).toBeInstanceOf(
//       TableTTLUpdater,
//     );
//   });
//   test("should be an instance of TableUpdater", () => {
//     expect(dynatron.Tables.update({} as any)).toBeInstanceOf(TableUpdater);
//   });
// });
