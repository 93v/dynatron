import { TableRequest } from "../../../src/requesters/_core/table-request";

describe("Table Request", () => {
  test("should default to 1 on negative latency", () => {
    const instance = new TableRequest();

    expect(instance.relaxLatencies(-1)).toHaveProperty("patienceRatio", 1);
  });
  test("should return an instance of TableRequest", () => {
    const instance = new TableRequest();
    expect(instance.relaxLatencies()).toBeInstanceOf(TableRequest);
  });
});
