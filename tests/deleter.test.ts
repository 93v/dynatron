import { ConditionChecker } from "../src/requesters/2.1-condition-checker";
import { Deleter } from "../src/requesters/2.1.1-deleter";

describe("Deleter", () => {
  test("should be an instance of ConditionChecker", () => {
    const instance = new Deleter();
    expect(instance).toBeInstanceOf(ConditionChecker);
  });

  test("should be an instance of Deleter", () => {
    const instance = new Deleter();
    expect(instance).toBeInstanceOf(Deleter);
  });
});
