import { serializeAttributePath } from "../../src/utils/attribute-path-serializer";
import nextAlpha from "../../src/utils/next-alpha-char-generator";

beforeEach(() => {
  nextAlpha.reset();
});

describe("Serialize Attribute Path", () => {
  test("should return an object of a specific stricture", () => {
    expect(serializeAttributePath("id")).toMatchObject({
      expressionString: "#a",
      expressionAttributeNames: {
        "#a": "id",
      },
    });
  });
  test("should return an object of a specific stricture", () => {
    expect(serializeAttributePath("id[1]")).toMatchObject({
      expressionString: "#a[1]",
      expressionAttributeNames: {
        "#a": "id",
      },
    });
  });
  test("should return an object of a specific stricture", () => {
    expect(serializeAttributePath("id.tag")).toMatchObject({
      expressionString: "#a.#b",
      expressionAttributeNames: {
        "#a": "id",
        "#b": "tag",
      },
    });
  });
});
