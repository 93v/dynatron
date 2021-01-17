import { CollectionGetter } from "../src/requesters/1.3-collection-getter";
import { Querier } from "../src/requesters/1.3.1-querier";

describe("Querier", () => {
  test("should be an instance of CollectionGetter", () => {
    const instance = new Querier();
    expect(instance).toBeInstanceOf(CollectionGetter);
  });

  test("should be an instance of Querier", () => {
    const instance = new Querier();
    expect(instance).toBeInstanceOf(Querier);
  });
});
