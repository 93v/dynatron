import { Requester } from "../src/requesters/0-requester";
import { TransactGetter } from "../src/requesters/3-transact-getter";

describe("TransactGetter", () => {
  test("should be an instance of Requester", () => {
    const instance = new TransactGetter();
    expect(instance).toBeInstanceOf(Requester);
  });

  test("should be an instance of TransactGetter", () => {
    const instance = new TransactGetter();
    expect(instance).toBeInstanceOf(TransactGetter);
  });
});
