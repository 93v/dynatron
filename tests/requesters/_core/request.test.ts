import { Request } from "../../../src/requesters/_core/request";

describe("Request", () => {
  test("should default to 1 on negative latency", () => {
    const instance = new Request();

    expect(instance.relaxLatencies(-1)).toHaveProperty("patienceRatio", 1);
  });
  test("should return an instance of Request", () => {
    const instance = new Request();
    expect(instance.relaxLatencies()).toBeInstanceOf(Request);
  });
});
