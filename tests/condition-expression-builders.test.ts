import {
  and,
  attributeExists,
  attributeNotExists,
  attributeType,
  beginsWith,
  between,
  contains,
  eq,
  equals,
  falsy,
  greaterThan,
  greaterThanOrEquals,
  gt,
  gte,
  isConditionEmptyDeep,
  isFalsy,
  isIn,
  isNullish,
  isTruthy,
  lessThan,
  lessThanOrEquals,
  lt,
  lte,
  ne,
  not,
  notEquals,
  nullish,
  or,
  size,
  truthy,
} from "../src/condition-expression-builders";

describe("Condition Expression Builders", () => {
  test("should create 'AND' condition", () => {
    expect(and(eq("path", "value"))).toEqual({
      kind: "AND",
      conditions: [
        {
          kind: "=",
          attributePath: "path",
          value: "value",
        },
      ],
    });
  });

  test("should create 'attributeExists' condition", () => {
    expect(attributeExists("path")).toEqual({
      kind: "attribute_exists",
      attributePath: "path",
    });
  });

  test("should create 'attributeNotExists' condition", () => {
    expect(attributeNotExists("path")).toEqual({
      kind: "attribute_not_exists",
      attributePath: "path",
    });
  });

  test("should create 'attributeType' condition", () => {
    expect(attributeType("path", "binary")).toEqual({
      kind: "attribute_type",
      attributePath: "path",
      value: "B",
    });
  });

  test("should create 'beginsWith' condition", () => {
    expect(beginsWith("path", "substr")).toEqual({
      kind: "begins_with",
      attributePath: "path",
      value: "substr",
    });
  });

  test("should create 'between' condition", () => {
    expect(between("path", ["left", "right"])).toEqual({
      kind: "BETWEEN",
      attributePath: "path",
      values: ["left", "right"],
    });
  });

  test("should create 'contains' condition", () => {
    expect(contains("path", "substr")).toEqual({
      kind: "contains",
      attributePath: "path",
      value: "substr",
    });
  });

  test("should create 'equals' condition", () => {
    expect(equals("path", "substr")).toEqual({
      kind: "=",
      attributePath: "path",
      value: "substr",
    });
    expect(eq("path", "substr")).toEqual({
      kind: "=",
      attributePath: "path",
      value: "substr",
    });
  });

  test("should create 'greaterThan' condition", () => {
    expect(greaterThan("path", "substr")).toEqual({
      kind: ">",
      attributePath: "path",
      value: "substr",
    });
    expect(gt("path", "substr")).toEqual({
      kind: ">",
      attributePath: "path",
      value: "substr",
    });
  });

  test("should create 'greaterThanOrEquals' condition", () => {
    expect(greaterThanOrEquals("path", "substr")).toEqual({
      kind: ">=",
      attributePath: "path",
      value: "substr",
    });
    expect(gte("path", "substr")).toEqual({
      kind: ">=",
      attributePath: "path",
      value: "substr",
    });
  });

  test("should create 'isIn' condition", () => {
    expect(isIn("path", ["substr"])).toEqual({
      kind: "IN",
      attributePath: "path",
      values: ["substr"],
    });
  });

  test("should create 'lessThan' condition", () => {
    expect(lessThan("path", "substr")).toEqual({
      kind: "<",
      attributePath: "path",
      value: "substr",
    });
    expect(lt("path", "substr")).toEqual({
      kind: "<",
      attributePath: "path",
      value: "substr",
    });
  });

  test("should create 'lessThanOrEquals' condition", () => {
    expect(lessThanOrEquals("path", "substr")).toEqual({
      kind: "<=",
      attributePath: "path",
      value: "substr",
    });
    expect(lte("path", "substr")).toEqual({
      kind: "<=",
      attributePath: "path",
      value: "substr",
    });
  });

  test("should create 'NOT' condition", () => {
    expect(not(eq("path", "value"))).toEqual({
      kind: "NOT",
      condition: {
        kind: "=",
        attributePath: "path",
        value: "value",
      },
    });
  });

  test("should create 'notEquals' condition", () => {
    expect(notEquals("path", "value")).toEqual({
      kind: "<>",
      attributePath: "path",
      value: "value",
    });
    expect(ne("path", "value")).toEqual({
      kind: "<>",
      attributePath: "path",
      value: "value",
    });
  });

  test("should create 'OR' condition", () => {
    expect(or(eq("path", "value"))).toEqual({
      kind: "OR",
      conditions: [
        {
          kind: "=",
          attributePath: "path",
          value: "value",
        },
      ],
    });
  });

  test("should create 'size' condition", () => {
    expect(size("path")).toEqual({
      kind: "size",
      attributePath: "path",
    });
  });

  test("should check 'isConditionEmptyDeep'", () => {
    expect(
      isConditionEmptyDeep([or([or(), and([and()], and())]), undefined, or()]),
    ).toBe(true);

    expect(isConditionEmptyDeep([[or(), or()]])).toBe(true);

    expect(isConditionEmptyDeep([eq("path", "value")])).toBe(false);
  });

  test("should check 'isNullish'", () => {
    expect(isNullish("name")).toEqual({
      kind: "OR",
      conditions: [
        {
          kind: "attribute_not_exists",
          attributePath: "name",
        },
        {
          kind: "attribute_type",
          attributePath: "name",
          value: "NULL",
        },
        {
          kind: "=",
          attributePath: "name",
          // eslint-disable-next-line unicorn/no-null
          value: null,
        },
      ],
    });
    expect(nullish("name")).toEqual({
      kind: "OR",
      conditions: [
        {
          kind: "attribute_not_exists",
          attributePath: "name",
        },
        {
          kind: "attribute_type",
          attributePath: "name",
          value: "NULL",
        },
        {
          kind: "=",
          attributePath: "name",
          // eslint-disable-next-line unicorn/no-null
          value: null,
        },
      ],
    });
  });

  test("should check 'isFalsy'", () => {
    expect(isFalsy("name")).toEqual({
      kind: "OR",
      conditions: [
        {
          kind: "OR",
          conditions: [
            {
              kind: "attribute_not_exists",
              attributePath: "name",
            },
            {
              kind: "attribute_type",
              attributePath: "name",
              value: "NULL",
            },
            {
              kind: "=",
              attributePath: "name",
              // eslint-disable-next-line unicorn/no-null
              value: null,
            },
          ],
        },
        {
          kind: "IN",
          attributePath: "name",
          values: [false, 0, -0, ""],
        },
      ],
    });
    expect(falsy("name")).toEqual({
      kind: "OR",
      conditions: [
        {
          kind: "OR",
          conditions: [
            {
              kind: "attribute_not_exists",
              attributePath: "name",
            },
            {
              kind: "attribute_type",
              attributePath: "name",
              value: "NULL",
            },
            {
              kind: "=",
              attributePath: "name",
              // eslint-disable-next-line unicorn/no-null
              value: null,
            },
          ],
        },
        {
          kind: "IN",
          attributePath: "name",
          values: [false, 0, -0, ""],
        },
      ],
    });
  });
  test("should check 'isTruthy'", () => {
    expect(isTruthy("name")).toEqual({
      kind: "NOT",
      condition: {
        kind: "OR",
        conditions: [
          {
            kind: "OR",
            conditions: [
              {
                kind: "attribute_not_exists",
                attributePath: "name",
              },
              {
                kind: "attribute_type",
                attributePath: "name",
                value: "NULL",
              },
              {
                kind: "=",
                attributePath: "name",
                // eslint-disable-next-line unicorn/no-null
                value: null,
              },
            ],
          },
          {
            kind: "IN",
            attributePath: "name",
            values: [false, 0, -0, ""],
          },
        ],
      },
    });
    expect(truthy("name")).toEqual({
      kind: "NOT",
      condition: {
        kind: "OR",
        conditions: [
          {
            kind: "OR",
            conditions: [
              {
                kind: "attribute_not_exists",
                attributePath: "name",
              },
              {
                kind: "attribute_type",
                attributePath: "name",
                value: "NULL",
              },
              {
                kind: "=",
                attributePath: "name",
                // eslint-disable-next-line unicorn/no-null
                value: null,
              },
            ],
          },
          {
            kind: "IN",
            attributePath: "name",
            values: [false, 0, -0, ""],
          },
        ],
      },
    });
  });
});
