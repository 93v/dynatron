import { serializeAttributePath } from "../../src/utils/attribute-path-serializer";
import nextAlpha from "../../src/utils/next-alpha-char-generator";

beforeEach(() => {
  nextAlpha.reset();
});

describe("Serialize Attribute Path", () => {
  test("should return an object of a specific stricture", () => {
    expect(serializeAttributePath("id")).toMatchObject({
      expression: "#a",
      expressionAttributeNames: {
        "#a": "id",
      },
    });
  });
  test("should return an object of a specific stricture", () => {
    expect(serializeAttributePath("id[1]")).toMatchObject({
      expression: "#a[1]",
      expressionAttributeNames: {
        "#a": "id",
      },
    });
  });
  test("should return an object of a specific stricture", () => {
    expect(serializeAttributePath("id.tag")).toMatchObject({
      expression: "#a.#b",
      expressionAttributeNames: {
        "#a": "id",
        "#b": "tag",
      },
    });
  });
});
