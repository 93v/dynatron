import {
  and,
  attributeExists,
  attributeNotExists,
  attributeType,
  beginsWith,
  between,
  contains,
  Dynatron,
  eq,
  equals,
  exists,
  greaterThan,
  greaterThanOrEquals,
  gt,
  gte,
  isIn,
  lessThan,
  lessThanOrEquals,
  loadProfileCredentials,
  lt,
  lte,
  ne,
  not,
  notEquals,
  notExists,
  or,
  size,
  type,
} from "../src";

describe("Check exports", () => {
  test("should export Dynatron", () => {
    expect(Dynatron).toBeDefined();
    expect(new Dynatron("")).toBeInstanceOf(Dynatron);
  });
  test("should export and", () => {
    expect(and).toBeDefined();
  });
  test("should export attributeExists", () => {
    expect(attributeExists).toBeDefined();
  });
  test("should export attributeExists", () => {
    expect(exists).toBeDefined();
  });
  test("should export attributeNotExists", () => {
    expect(attributeNotExists).toBeDefined();
  });
  test("should export attributeNotExists", () => {
    expect(notExists).toBeDefined();
  });
  test("should export attributeType", () => {
    expect(attributeType).toBeDefined();
  });
  test("should export attributeType", () => {
    expect(type).toBeDefined();
  });
  test("should export beginsWith", () => {
    expect(beginsWith).toBeDefined();
  });
  test("should export between", () => {
    expect(between).toBeDefined();
  });
  test("should export contains", () => {
    expect(contains).toBeDefined();
  });
  test("should export eq", () => {
    expect(eq).toBeDefined();
  });
  test("should export equals", () => {
    expect(equals).toBeDefined();
  });
  test("should export greaterThan", () => {
    expect(greaterThan).toBeDefined();
  });
  test("should export greaterThanOrEquals", () => {
    expect(greaterThanOrEquals).toBeDefined();
  });
  test("should export gt", () => {
    expect(gt).toBeDefined();
  });
  test("should export gte", () => {
    expect(gte).toBeDefined();
  });
  test("should export isIn", () => {
    expect(isIn).toBeDefined();
  });
  test("should export lessThan", () => {
    expect(lessThan).toBeDefined();
  });
  test("should export lessThanOrEquals", () => {
    expect(lessThanOrEquals).toBeDefined();
  });
  test("should export lt", () => {
    expect(lt).toBeDefined();
  });
  test("should export lte", () => {
    expect(lte).toBeDefined();
  });
  test("should export ne", () => {
    expect(ne).toBeDefined();
  });
  test("should export not", () => {
    expect(not).toBeDefined();
  });
  test("should export notEquals", () => {
    expect(notEquals).toBeDefined();
  });
  test("should export or", () => {
    expect(or).toBeDefined();
  });
  test("should export size", () => {
    expect(size).toBeDefined();
  });
  test("should export loadProfileCredentials", () => {
    expect(loadProfileCredentials).toBeDefined();
  });
});
