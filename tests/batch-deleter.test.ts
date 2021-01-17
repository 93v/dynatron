import { Mutator } from "../src/requesters/2-mutator";
import { BatchDeleter } from "../src/requesters/2.2-batch-deleter";

describe("BatchDeleter", () => {
  test("should be an instance of Mutator", () => {
    const instance = new BatchDeleter();
    expect(instance).toBeInstanceOf(Mutator);
  });

  test("should be an instance of BatchDeleter", () => {
    const instance = new BatchDeleter();
    expect(instance).toBeInstanceOf(BatchDeleter);
  });
});
