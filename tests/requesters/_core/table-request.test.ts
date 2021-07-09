import { TableRequest } from "../../../src/requesters/_core/table-request";

describe("Table Request", () => {
  test("should throw on negative latency", () => {
    const instance = new TableRequest();

    expect(() => instance.relaxLatencies(-1)).toThrow(
      "The ratio must be positive",
    );
  });
  test("should return an instance of TableRequest", () => {
    const instance = new TableRequest();
    expect(instance.relaxLatencies()).toBeInstanceOf(TableRequest);
  });
});
