import { Mutator } from "../src/requesters/2-mutator";
import { BatchPutter } from "../src/requesters/2.3-batch-putter";

describe("BatchPutter", () => {
  test("should be an instance of Mutator", () => {
    const instance = new BatchPutter();
    expect(instance).toBeInstanceOf(Mutator);
  });

  test("should be an instance of BatchPutter", () => {
    const instance = new BatchPutter();
    expect(instance).toBeInstanceOf(BatchPutter);
  });
});
