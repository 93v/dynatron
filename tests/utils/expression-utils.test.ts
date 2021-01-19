import { eq } from "../../src/condition-expression-builders";
import {
  isTopLevelAttributePath,
  marshallConditionExpression,
} from "../../src/utils/expressions-utils";
import { nextAlpha } from "../../src/utils/next-alpha-char-generator";

describe("isTopLevelAttributePath", () => {
  test("should return true", () => {
    expect(isTopLevelAttributePath("id")).toBe(true);
  });

  test("should return true", () => {
    expect(isTopLevelAttributePath("id\\.type")).toBe(true);
  });

  test("should return false", () => {
    expect(isTopLevelAttributePath("id.type")).toBe(false);
  });

  test("should return false", () => {
    expect(isTopLevelAttributePath("id[0]")).toBe(false);
  });
});

describe("Condition expression marshaller", () => {
  test("should return a simple object", () => {
    nextAlpha.reset();
    expect(marshallConditionExpression([eq("path", "value")])).toEqual({
      expressionString: "#a=:b",
      expressionAttributeNames: { "#a": "path" },
      expressionAttributeValues: { ":b": "value" },
    });
  });
});
