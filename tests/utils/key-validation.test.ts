import { validateKey } from "../../src/utils/key-validation";

describe("Misc utils validation", () => {
  test("should fail validation if key is an empty object", () => {
    expect(() => {
      validateKey({
        key: {},
      });
    }).toThrowError("At least 1 property must be present in the key");
  });

  test("should fail validation with 2 keys if single", () => {
    expect(() => {
      validateKey({
        key: {
          id: 1,
          name: "hello",
        },
        singlePropertyKey: true,
      });
    }).toThrowError("At most 1 property must be present in the key");
  });

  test("should fail validation with 3 keys", () => {
    expect(() => {
      validateKey({
        key: {
          id: 1,
          name: "hello",
          age: 30,
        },
      });
    }).toThrowError("At most 2 properties must be present in the key");
  });

  test("should pass the validation with 1 key", () => {
    expect(() => {
      validateKey({
        key: {
          id: 1,
        },
      });
    }).not.toThrow();
  });

  test("should pass the validation with 2 keys", () => {
    expect(() => {
      validateKey({
        key: {
          id: 1,
          name: "hello",
        },
      });
    }).not.toThrow();
  });
});
