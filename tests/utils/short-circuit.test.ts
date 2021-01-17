import { createShortCircuit } from "../../src/utils/short-circuit";

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
