import {
  assertNever,
  createShortCircuit,
  isRetryableError,
  TAKING_TOO_LONG_EXCEPTION,
  validateKey,
} from "../../src/utils/misc-utils";

describe("Short Circuit", () => {
  test("should fire an error with a specific text", async () => {
    const shortCircuit = createShortCircuit({
      duration: 0,
      error: new Error("Time's up"),
    });

    expect(shortCircuit).toMatchObject({
      launch: expect.any(Function),
      halt: expect.any(Function),
    });

    await expect(shortCircuit.launch()).rejects.toThrow("Time's up");
  });

  test("should fail on negative duration", () => {
    const parameters = {
      duration: -1,
      error: new Error("Time's up"),
    };

    expect(() => {
      createShortCircuit(parameters);
    }).toThrow(new Error("Duration cannot be negative"));
  });

  test("should fail to halt before starting duration", () => {
    const shortCircuit = createShortCircuit({
      duration: 0,
      error: new Error("Time's up"),
    });

    expect(() => {
      shortCircuit.halt();
    }).toThrow(new Error("Cannot halt before launching"));
  });

  test("should halt normally", () => {
    const shortCircuit = createShortCircuit({
      duration: 0,
      error: new Error("Time's up"),
    });

    expect(() => {
      shortCircuit.launch();
      shortCircuit.halt();
    }).not.toThrow();
  });
});

describe("Assert Never", () => {
  test("should always fail", () => {
    expect(() => assertNever("incorrect" as never)).toThrow(
      `Unexpected value: "incorrect"`,
    );
  });

  test("should always fail", () => {
    expect(() => assertNever(3 as never)).toThrow(`Unexpected value: 3`);
  });
});

describe("Is Retryable Error", () => {
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

describe("Validate Key", () => {
  test("should fail validation if key is an empty object", () => {
    expect(() => {
      validateKey({});
    }).toThrowError("At least 1 property must be present in the key");
  });

  test("should fail validation with 3 keys", () => {
    expect(() => {
      validateKey({
        id: 1,
        name: "hello",
        age: 30,
      });
    }).toThrowError("At most 2 properties must be present in the key");
  });

  test("should pass the validation with 1 key", () => {
    expect(() => {
      validateKey({
        id: 1,
      });
    }).not.toThrow();
  });

  test("should pass the validation with 2 keys", () => {
    expect(() => {
      validateKey({
        id: 1,
        name: "hello",
      });
    }).not.toThrow();
  });
});
