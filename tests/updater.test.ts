import { ConditionChecker } from "../src/requesters/2.1-condition-checker";
import { Updater } from "../src/requesters/2.1.3-updater";

describe("Updater", () => {
  test("should be an instance of ConditionChecker", () => {
    const instance = new Updater();
    expect(instance).toBeInstanceOf(ConditionChecker);
  });

  test("should be an instance of Updater", () => {
    const instance = new Updater();
    expect(instance).toBeInstanceOf(Updater);
  });
});
