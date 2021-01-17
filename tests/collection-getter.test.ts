import { Reader } from "../src/requesters/1-reader";
import { CollectionGetter } from "../src/requesters/1.3-collection-getter";

describe("CollectionGetter", () => {
  test("should be an instance of Reader", () => {
    const instance = new CollectionGetter();
    expect(instance).toBeInstanceOf(Reader);
  });

  test("should be an instance of CollectionGetter", () => {
    const instance = new CollectionGetter();
    expect(instance).toBeInstanceOf(CollectionGetter);
  });
});
