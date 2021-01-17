import { ConditionChecker } from "../src/requesters/2.1-condition-checker";
import { Putter } from "../src/requesters/2.1.2-putter";

describe("Putter", () => {
  test("should be an instance of ConditionChecker", () => {
    const instance = new Putter();
    expect(instance).toBeInstanceOf(ConditionChecker);
  });

  test("should be an instance of Putter", () => {
    const instance = new Putter();
    expect(instance).toBeInstanceOf(Putter);
  });
});
