import { Reader } from "../src/requesters/1-reader";
import { BatchGetter } from "../src/requesters/1.2-batch-getter";

describe("BatchGetter", () => {
  test("should be an instance of Reader", () => {
    const instance = new BatchGetter();
    expect(instance).toBeInstanceOf(Reader);
  });

  test("should be an instance of BatchGetter", () => {
    const instance = new BatchGetter();
    expect(instance).toBeInstanceOf(BatchGetter);
  });
});
