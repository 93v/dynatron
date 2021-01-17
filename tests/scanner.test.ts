import { CollectionGetter } from "../src/requesters/1.3-collection-getter";
import { Scanner } from "../src/requesters/1.3.2-scanner";

describe("Scanner", () => {
  test("should be an instance of CollectionGetter", () => {
    const instance = new Scanner();
    expect(instance).toBeInstanceOf(CollectionGetter);
  });

  test("should be an instance of Scanner", () => {
    const instance = new Scanner();
    expect(instance).toBeInstanceOf(Scanner);
  });
});
