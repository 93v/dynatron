import { Mutator } from "../src/requesters/2-mutator";
import { ConditionChecker } from "../src/requesters/2.1-condition-checker";

describe("ConditionChecker", () => {
  test("should be an instance of Mutator", () => {
    const instance = new ConditionChecker();
    expect(instance).toBeInstanceOf(Mutator);
  });

  test("should be an instance of ConditionChecker", () => {
    const instance = new ConditionChecker();
    expect(instance).toBeInstanceOf(ConditionChecker);
  });
});
