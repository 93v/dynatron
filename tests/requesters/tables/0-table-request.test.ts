import { TableRequest } from "../../../src/requesters/tables/0-table-request";

describe("Table Request", () => {
  test("should return an instance of TableRequest", () => {
    const instance = new TableRequest();
    expect(instance).toBeInstanceOf(TableRequest);
  });

  test("should return an instance of TableRequest", () => {
    const instance = new TableRequest();
    expect(instance.relaxLatencies(2)).toBeInstanceOf(TableRequest);
  });

  test("should return an instance of TableRequest", () => {
    const instance = new TableRequest();
    expect(instance.relaxLatencies()).toBeInstanceOf(TableRequest);
  });

  test("should throw", () => {
    const instance = new TableRequest();
    expect(() => instance.relaxLatencies(-1)).toThrow();
  });
});
