import { Mutator } from "../src/requesters/2-mutator";
import { TransactWriter } from "../src/requesters/2.4-transact-writer";

describe("TransactWriter", () => {
  test("should be an instance of Mutator", () => {
    const instance = new TransactWriter();
    expect(instance).toBeInstanceOf(Mutator);
  });

  test("should be an instance of TransactWriter", () => {
    const instance = new TransactWriter();
    expect(instance).toBeInstanceOf(TransactWriter);
  });
});
