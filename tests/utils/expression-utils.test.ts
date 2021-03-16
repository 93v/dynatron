import {
  and,
  attributeExists,
  attributeNotExists,
  attributeType,
  beginsWith,
  between,
  contains,
  eq,
  gt,
  isIn,
  not,
  size,
} from "../../src/condition-expression-builders";
import {
  marshallConditionExpression,
  marshallUpdateExpression,
  parseAttributePath,
} from "../../src/utils/expressions-utils";
import { nextAlpha } from "../../src/utils/next-alpha-char-generator";

beforeEach(() => {
  nextAlpha.reset();
});

describe("parseAttributePath", () => {
  test("should fail on empty path", () => {
    expect(() => {
      parseAttributePath("");
    }).toThrowError("Empty path");
  });

  test("should return an array", () => {
    expect(parseAttributePath("id")).toEqual([{ type: "name", name: "id" }]);
  });

  test("should return an array", () => {
    expect(parseAttributePath("user.name")).toEqual([
      { type: "name", name: "user" },
      { type: "name", name: "name" },
    ]);
  });

  test("should return an array", () => {
    expect(parseAttributePath("tags[0]")).toEqual([
      { type: "name", name: "tags" },
      { type: "index", index: 0 },
    ]);
  });

  test("should return an array", () => {
    expect(parseAttributePath("tags\\[0]")).toEqual([
      { type: "name", name: "tags[0]" },
    ]);
  });

  test("should return an array", () => {
    expect(parseAttributePath("tags[0][2]")).toEqual([
      { type: "name", name: "tags" },
      { type: "index", index: 0 },
      { type: "index", index: 2 },
    ]);
  });

  test("should return an array", () => {
    expect(parseAttributePath("tags[0].value")).toEqual([
      { type: "name", name: "tags" },
      { type: "index", index: 0 },
      { type: "name", name: "value" },
    ]);
  });

  test("should return an array", () => {
    expect(
      parseAttributePath("user.profile.addresses.homeAddress[1].street.name"),
    ).toEqual([
      { type: "name", name: "user" },
      { type: "name", name: "profile" },
      { type: "name", name: "addresses" },
      { type: "name", name: "homeAddress" },
      { type: "index", index: 1 },
      { type: "name", name: "street" },
      { type: "name", name: "name" },
    ]);
  });

  test("should return an array", () => {
    expect(parseAttributePath("user\\.name")).toEqual([
      { type: "name", name: "user.name" },
    ]);
  });

  test("should return an array", () => {
    expect(parseAttributePath("user\\name")).toEqual([
      { type: "name", name: "user\\name" },
    ]);
  });

  test("should throw", () => {
    expect(() => {
      parseAttributePath("[0]");
    }).toThrowError(
      `Invalid control character encountered in path "[0]" at index [0]`,
    );
  });

  test("should throw", () => {
    expect(() => {
      parseAttributePath("tags[0]name");
    }).toThrowError(
      `Bare identifier encountered between list index accesses in path "tags[0]name" at index [7]`,
    );
  });

  test("should throw", () => {
    expect(() => {
      parseAttributePath("tags[index]");
    }).toThrowError(
      `Invalid array index character "i" encountered in path "tags[index]" at index [5]`,
    );
  });

  test("should throw", () => {
    expect(() => {
      parseAttributePath("tags[]");
    }).toThrowError(
      `Empty array index encountered in path "tags[]" at index [5]`,
    );
  });

  test("should throw", () => {
    expect(() => {
      parseAttributePath("tags..");
    }).toThrowError(
      'Invalid control character encountered in path "tags.." at index [5]',
    );
  });

  test("should throw", () => {
    expect(() => {
      parseAttributePath("tags.");
    }).toThrowError(
      'Invalid control character encountered in path "tags." at index [4]',
    );
  });

  test("should throw", () => {
    expect(() => {
      parseAttributePath("tags[0].");
    }).toThrowError(
      'Invalid control character encountered in path "tags[0]." at index [7]',
    );
  });
});

describe("Condition expression marshaller", () => {
  test("should return a simple object", () => {
    expect(marshallConditionExpression([eq("path", "value")])).toEqual({
      expressionString: "#a=:b",
      expressionAttributeNames: { "#a": "path" },
      expressionAttributeValues: { ":b": "value" },
    });
  });

  test("should return a simple object", () => {
    expect(
      marshallConditionExpression([eq("path\\.subpath\\[\\", "value")]),
    ).toEqual({
      expressionString: "#a=:b",
      expressionAttributeNames: { "#a": "path.subpath[\\" },
      expressionAttributeValues: { ":b": "value" },
    });
  });

  test("should return a simple object", () => {
    expect(
      marshallConditionExpression([eq("path[0][2].name", "value")]),
    ).toEqual({
      expressionString: "#a[0][2].#b=:c",
      expressionAttributeNames: { "#a": "path", "#b": "name" },
      expressionAttributeValues: { ":c": "value" },
    });
  });

  test("should return a simple object", () => {
    expect(() =>
      marshallConditionExpression([eq("path[0][2]name", "value")]),
    ).toThrow();
  });

  test("should return a simple object", () => {
    expect(() =>
      marshallConditionExpression([eq("path[0][a]name", "value")]),
    ).toThrow();
  });

  test("should return a simple object", () => {
    expect(() =>
      marshallConditionExpression([eq("path[0][]name", "value")]),
    ).toThrow();
  });

  test("should return a simple object", () => {
    expect(() => marshallConditionExpression([eq("[", "value")])).toThrow();
  });

  test("should return a simple object", () => {
    expect(marshallConditionExpression([attributeExists("path")])).toEqual({
      expressionString: "attribute_exists(#a)",
      expressionAttributeNames: { "#a": "path" },
      expressionAttributeValues: {},
    });
    expect(marshallConditionExpression([attributeNotExists("path")])).toEqual({
      expressionString: "attribute_not_exists(#b)",
      expressionAttributeNames: { "#b": "path" },
      expressionAttributeValues: {},
    });
  });

  test("should return a simple object", () => {
    expect(
      marshallConditionExpression([attributeType("path", "binary")]),
    ).toEqual({
      expressionString: "attribute_type(#a,:b)",
      expressionAttributeNames: { "#a": "path" },
      expressionAttributeValues: { ":b": "B" },
    });
  });

  test("should return a simple object", () => {
    expect(marshallConditionExpression([beginsWith("path", "binary")])).toEqual(
      {
        expressionString: "begins_with(#a,:b)",
        expressionAttributeNames: { "#a": "path" },
        expressionAttributeValues: { ":b": "binary" },
      },
    );
  });

  test("should return a simple object", () => {
    expect(marshallConditionExpression([contains("path", "binary")])).toEqual({
      expressionString: "contains(#a,:b)",
      expressionAttributeNames: { "#a": "path" },
      expressionAttributeValues: { ":b": "binary" },
    });
  });

  test("should return a simple object", () => {
    expect(marshallConditionExpression([between("path", [1, 2])])).toEqual({
      expressionString: "#a BETWEEN :b AND :c",
      expressionAttributeNames: { "#a": "path" },
      expressionAttributeValues: { ":b": 1, ":c": 2 },
    });
  });

  test("should return a simple object", () => {
    expect(
      marshallConditionExpression([between(size("path"), [1, 2])]),
    ).toEqual({
      expressionString: "size(#a) BETWEEN :b AND :c",
      expressionAttributeNames: { "#a": "path" },
      expressionAttributeValues: { ":b": 1, ":c": 2 },
    });
  });

  test("should return a simple object", () => {
    expect(marshallConditionExpression([gt(size("path"), 4)])).toEqual({
      expressionString: "size(#a)>:b",
      expressionAttributeNames: { "#a": "path" },
      expressionAttributeValues: { ":b": 4 },
    });
  });

  test("should return a simple object", () => {
    expect(
      marshallConditionExpression([isIn(size("path.subpath"), [1, 2, 3])]),
    ).toEqual({
      expressionString: "size(#a.#b) IN(:c,:d,:e)",
      expressionAttributeNames: { "#a": "path", "#b": "subpath" },
      expressionAttributeValues: { ":c": 1, ":d": 2, ":e": 3 },
    });
  });

  test("should return a simple object", () => {
    expect(marshallConditionExpression([not(isIn("path", [1, 2, 3]))])).toEqual(
      {
        expressionString: "(NOT #a IN(:b,:c,:d))",
        expressionAttributeNames: { "#a": "path" },
        expressionAttributeValues: { ":b": 1, ":c": 2, ":d": 3 },
      },
    );
  });

  test("should return a simple object", () => {
    expect(
      marshallConditionExpression([
        and(isIn("path", [1, 2, 3]), gt("value", 4)),
        and(isIn("path2", [1, 2, 3]), gt("value2", 4)),
      ]),
    ).toEqual({
      expressionString:
        "(#a IN(:b,:c,:d) AND #e>:f) AND (#g IN(:h,:i,:j) AND #k>:l)",
      expressionAttributeNames: {
        "#a": "path",
        "#e": "value",
        "#g": "path2",
        "#k": "value2",
      },
      expressionAttributeValues: {
        ":b": 1,
        ":c": 2,
        ":d": 3,
        ":f": 4,
        ":h": 1,
        ":i": 2,
        ":j": 3,
        ":l": 4,
      },
    });
  });

  test("should throw", () => {
    expect(() => marshallConditionExpression([{} as any])).toThrow();
  });
});

describe("Update expression marshaller", () => {
  test("should return a simple object", () => {
    nextAlpha.reset();
    expect(marshallUpdateExpression([])).toEqual({
      expressionString: "",
      expressionAttributeNames: {},
      expressionAttributeValues: {},
    });
  });

  test("should return a simple object", () => {
    nextAlpha.reset();
    expect(marshallUpdateExpression([])).toEqual({
      expressionString: "",
      expressionAttributeNames: {},
      expressionAttributeValues: {},
    });
  });

  test("should return a simple object", () => {
    nextAlpha.reset();
    expect(
      marshallUpdateExpression([
        { kind: "add", attributePath: "id", value: 5 },
        { kind: "set", attributePath: "id", value: 5, ifDoesNotExist: true },
      ]),
    ).toEqual({
      expressionString: "ADD #a :b SET #c=if_not_exists(#c,:d)",
      expressionAttributeNames: { "#a": "id", "#c": "id" },
      expressionAttributeValues: { ":b": 5, ":d": 5 },
    });
  });

  test("should return a simple object", () => {
    nextAlpha.reset();
    expect(
      marshallUpdateExpression([
        { kind: "delete", attributePath: "id", value: new Set([5]) },
      ]),
    ).toEqual({
      expressionString: "DELETE #a :b",
      expressionAttributeNames: { "#a": "id" },
      expressionAttributeValues: { ":b": new Set([5]) },
    });
  });

  test("should return a simple object", () => {
    nextAlpha.reset();
    expect(
      marshallUpdateExpression([{ kind: "remove", attributePath: "id" }]),
    ).toEqual({
      expressionString: "REMOVE #a",
      expressionAttributeNames: { "#a": "id" },
      expressionAttributeValues: {},
    });
  });

  test("should return a simple object", () => {
    nextAlpha.reset();
    expect(
      marshallUpdateExpression([
        { kind: "prepend", attributePath: "id", value: 5 },
        { kind: "append", attributePath: "id", value: 5 },
      ]),
    ).toEqual({
      expressionString: "SET #a=list_append(:b,#a), #c=list_append(#c,:d)",
      expressionAttributeNames: { "#a": "id", "#c": "id" },
      expressionAttributeValues: { ":b": 5, ":d": 5 },
    });
  });

  test("should return a simple object", () => {
    nextAlpha.reset();
    expect(
      marshallUpdateExpression([
        { kind: "increment", attributePath: "id[0]", value: 5 },
        { kind: "increment", attributePath: "id[0]", value: -5 },
      ]),
    ).toEqual({
      expressionString: "SET #a[0]=#a[0]+:b, #c[0]=#c[0]+:d",
      expressionAttributeNames: { "#a": "id", "#c": "id" },
      expressionAttributeValues: { ":b": 5, ":d": -5 },
    });
  });

  test("should throw", () => {
    nextAlpha.reset();
    expect(() => {
      marshallUpdateExpression([
        { kind: "unknown", attributePath: "id", value: 5 } as any,
      ]);
    }).toThrow();
  });

  test("should return a simple object", () => {
    nextAlpha.reset();
    expect(
      marshallUpdateExpression([
        { kind: "set", attributePath: "id", value: 5, ifDoesNotExist: false },
      ]),
    ).toEqual({
      expressionString: "SET #a=:b",
      expressionAttributeNames: { "#a": "id" },
      expressionAttributeValues: { ":b": 5 },
    });
  });

  test("should return a simple object without specified key", () => {
    nextAlpha.reset();
    expect(
      marshallUpdateExpression(
        [
          { kind: "set", attributePath: "id", value: 5, ifDoesNotExist: false },
          {
            kind: "set",
            attributePath: "notId",
            value: 10,
            ifDoesNotExist: false,
          },
        ],
        undefined,
        { id: 5 },
      ),
    ).toEqual({
      expressionString: "SET #a=:b",
      expressionAttributeNames: { "#a": "notId" },
      expressionAttributeValues: { ":b": 10 },
    });
  });
});
