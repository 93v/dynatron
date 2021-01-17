import { Reader } from "../src/requesters/1-reader";
import { Getter } from "../src/requesters/1.1-getter";

describe("Getter", () => {
  test("should be an instance of Reader", () => {
    const instance = new Getter();
    expect(instance).toBeInstanceOf(Reader);
  });

  test("should be an instance of Getter", () => {
    const instance = new Getter();
    expect(instance).toBeInstanceOf(Getter);
  });
});
