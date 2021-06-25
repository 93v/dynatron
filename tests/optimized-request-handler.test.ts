import { OptimizedRequestHandler } from "../src/optimized-request-handler";

describe("OptimizedRequestHandler", () => {
  test("should return an instance of OptimizedRequestHandler", () => {
    const requestHandler = new OptimizedRequestHandler();
    expect(requestHandler).toBeInstanceOf(OptimizedRequestHandler);
  });

  test("should return an instance of OptimizedRequestHandler", () => {
    const requestHandler = new OptimizedRequestHandler(100, 128, 128);
    expect(requestHandler).toBeInstanceOf(OptimizedRequestHandler);
  });
});
