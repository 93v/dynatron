import { TAKING_TOO_LONG_EXCEPTION } from "../../src/utils/constants";
import {
  assertNever,
  isRetryableError,
  serializeExpressionValue,
} from "../../src/utils/misc-utils";

describe("Misc utils serialization", () => {
  test("should serialize expression value", () => {
    const value = { key: "hello" };
    const serializedExpressionValue = serializeExpressionValue(value.key);
    expect(serializedExpressionValue.value).toEqual(value.key);
    expect(serializedExpressionValue.name).toHaveLength(2);
  });
});

describe("Misc utils assertion", () => {
  test("should always fail", () => {
    expect(() => assertNever("incorrect" as never)).toThrow(
      `Unexpected value: "incorrect"`,
    );
  });

  test("should always fail", () => {
    expect(() => assertNever(3 as never)).toThrow(`Unexpected value: 3`);
  });
});

describe("Misc utils retryable errors type", () => {
  const customError = new Error("Custom error") as any;
  customError.retryable = true;

  const customError2 = new Error("Provision error") as any;
  customError2.code = "ProvisionedThroughputExceededException";

  const customError3 = new Error("Throttling exception") as any;
  customError3.code = "ThrottlingException";

  const errors: [string, Error][] = [
    [TAKING_TOO_LONG_EXCEPTION, new Error(TAKING_TOO_LONG_EXCEPTION)],
    ["retryable", customError],
    ["ECONN", new Error("ECONN")],
    ["NetworkingError", new Error("NetworkingError")],
    ["InternalServerError", new Error("InternalServerError")],
    ["ProvisionedThroughputExceededException", customError2],
    ["ThrottlingException", customError3],
  ];
  test.each(errors)("given %1 returns true", (_, error) => {
    expect(isRetryableError(error)).toBe(true);
  });
});
