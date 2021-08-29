import { NativeAttributeValue } from "@aws-sdk/util-dynamodb";

import {
  AndCondition,
  AttributeExistsCondition,
  AttributeNotExistsCondition,
  AttributeType,
  AttributeTypeCondition,
  BeginsWithCondition,
  BetweenCondition,
  Condition,
  ContainsCondition,
  EqualsCondition,
  GreaterThanCondition,
  GreaterThanOrEqualsCondition,
  InCondition,
  LessThanCondition,
  LessThanOrEqualsCondition,
  NotCondition,
  NotEqualsCondition,
  OrCondition,
  SizeCondition,
} from "../types/conditions";

export const and = (
  ...conditions: (Condition | Condition[])[]
): AndCondition => ({
  kind: "AND",
  conditions: conditions.flatMap((c) => (Array.isArray(c) ? c : [c])),
});

export const all = and;

export const attributeExists = (
  attributePath: string,
): AttributeExistsCondition => ({
  kind: "attribute_exists",
  attributePath,
});
export const exists = attributeExists;

export const attributeNotExists = (
  attributePath: string,
): AttributeNotExistsCondition => ({
  kind: "attribute_not_exists",
  attributePath,
});
export const notExists = attributeNotExists;

export const attributeType = (
  attributePath: string,
  typeName: AttributeType,
): AttributeTypeCondition => {
  const shortAttributeTypes: Record<AttributeType, string> = {
    binary: "B",
    binarySet: "BS",
    boolean: "BOOL",
    list: "L",
    map: "M",
    null: "NULL",
    number: "N",
    numberSet: "NS",
    string: "S",
    stringSet: "SS",
  };

  return {
    kind: "attribute_type",
    attributePath,
    value: shortAttributeTypes[typeName],
  };
};
export const type = attributeType;

export const beginsWith = (
  attributePath: string,
  substr: string,
): BeginsWithCondition => ({
  kind: "begins_with",
  attributePath,
  value: substr,
});

export const between = (
  attributePath: string | SizeCondition,
  bounds: [NativeAttributeValue, NativeAttributeValue],
): BetweenCondition => ({
  kind: "BETWEEN",
  attributePath,
  values: bounds,
});

export const contains = (
  attributePath: string,
  substr: string | number,
): ContainsCondition => ({
  kind: "contains",
  attributePath,
  value: substr,
});

export const equals = (
  attributePath: string | SizeCondition,
  value: NativeAttributeValue,
): EqualsCondition => ({
  kind: "=",
  attributePath,
  value,
});
export const eq = equals;

export const greaterThan = (
  attributePath: string | SizeCondition,
  value: NativeAttributeValue,
): GreaterThanCondition => ({
  kind: ">",
  attributePath,
  value,
});
export const gt = greaterThan;

export const greaterThanOrEquals = (
  attributePath: string | SizeCondition,
  value: NativeAttributeValue,
): GreaterThanOrEqualsCondition => ({
  kind: ">=",
  attributePath,
  value,
});
export const gte = greaterThanOrEquals;

export const isIn = (
  attributePath: string | SizeCondition,
  values: {
    0: NativeAttributeValue;
  } & NativeAttributeValue[],
): InCondition => ({
  kind: "IN",
  attributePath,
  values,
});

export const lessThan = (
  attributePath: string | SizeCondition,
  value: NativeAttributeValue,
): LessThanCondition => ({
  kind: "<",
  attributePath,
  value,
});
export const lt = lessThan;

export const lessThanOrEquals = (
  attributePath: string | SizeCondition,
  value: NativeAttributeValue,
): LessThanOrEqualsCondition => ({
  kind: "<=",
  attributePath,
  value,
});
export const lte = lessThanOrEquals;

export const not = (condition: Condition): NotCondition => ({
  kind: "NOT",
  condition,
});

export const notEquals = (
  attributePath: string | SizeCondition,
  value: NativeAttributeValue,
): NotEqualsCondition => ({
  kind: "<>",
  attributePath,
  value,
});
export const ne = notEquals;

export const or = (
  ...conditions: (Condition | Condition[])[]
): OrCondition => ({
  kind: "OR",
  conditions: conditions.flatMap((c) => (Array.isArray(c) ? c : [c])),
});

export const any = or;

export const size = (attributePath: string): SizeCondition => ({
  kind: "size",
  attributePath,
});

export const isNullish = (attributePath: string): OrCondition => {
  return or(
    attributeNotExists(attributePath),
    attributeType(attributePath, "null"),
    // eslint-disable-next-line unicorn/no-null
    equals(attributePath, null),
  );
};

export const nullish = isNullish;

export const isFalsy = (attributePath: string): OrCondition => {
  return or(isNullish(attributePath), isIn(attributePath, [false, 0, -0, ""]));
};

export const falsy = isFalsy;

export const isTruthy = (attributePath: string): NotCondition =>
  not(isFalsy(attributePath));

export const truthy = isTruthy;

export const isConditionEmptyDeep = (
  conditions: (Condition | Condition[] | undefined)[],
): boolean =>
  conditions.every((argument) => {
    if (argument == undefined) {
      return true;
    }

    if (Array.isArray(argument)) {
      return isConditionEmptyDeep(argument);
    }

    if (argument.kind === "OR" || argument.kind === "AND") {
      return isConditionEmptyDeep(argument.conditions);
    }

    return false;
  });

export const attribute = (attributePath: string) => {
  return {
    attributeExists: attributeExists(attributePath),
    exists: () => attributeExists(attributePath),
    attributeNotExists: () => attributeNotExists(attributePath),
    notExists: () => attributeNotExists(attributePath),
    doesNotExist: () => attributeNotExists(attributePath),
    attributeType: (typeName: AttributeType) =>
      attributeType(attributePath, typeName),
    type: (typeName: AttributeType) => attributeType(attributePath, typeName),
    isOfType: (typeName: AttributeType) =>
      attributeType(attributePath, typeName),
    isBinary: () => attributeType(attributePath, "binary"),
    isBinarySet: () => attributeType(attributePath, "binarySet"),
    isBoolean: () => attributeType(attributePath, "boolean"),
    isList: () => attributeType(attributePath, "list"),
    isMap: () => attributeType(attributePath, "map"),
    isNull: () => attributeType(attributePath, "null"),
    isNumber: () => attributeType(attributePath, "number"),
    isNumberSet: () => attributeType(attributePath, "numberSet"),
    isString: () => attributeType(attributePath, "string"),
    isStringSet: () => attributeType(attributePath, "stringSet"),
    isUndefined: () => attributeNotExists(attributePath),
    beginsWith: (substr: string) => beginsWith(attributePath, substr),
    between: (bounds: [NativeAttributeValue, NativeAttributeValue]) =>
      between(attributePath, bounds),
    isBetween: (bounds: [NativeAttributeValue, NativeAttributeValue]) =>
      between(attributePath, bounds),
    contains: (substr: string | number) => contains(attributePath, substr),
    equals: (value: NativeAttributeValue) => equals(attributePath, value),
    eq: (value: NativeAttributeValue) => equals(attributePath, value),
    isEqualTo: (value: NativeAttributeValue) => equals(attributePath, value),
    greaterThan: (value: NativeAttributeValue) =>
      greaterThan(attributePath, value),
    gt: (value: NativeAttributeValue) => greaterThan(attributePath, value),
    isGreaterThan: (value: NativeAttributeValue) =>
      greaterThan(attributePath, value),
    greaterThanOrEquals: (value: NativeAttributeValue) =>
      greaterThanOrEquals(attributePath, value),
    gte: (value: NativeAttributeValue) =>
      greaterThanOrEquals(attributePath, value),
    isGreaterThanOrEquals: (value: NativeAttributeValue) =>
      greaterThanOrEquals(attributePath, value),
    isIn: (
      values: {
        0: NativeAttributeValue;
      } & NativeAttributeValue[],
    ) => isIn(attributePath, values),
    in: (
      values: {
        0: NativeAttributeValue;
      } & NativeAttributeValue[],
    ) => isIn(attributePath, values),
    lessThan: (value: NativeAttributeValue) => lessThan(attributePath, value),
    lt: (value: NativeAttributeValue) => lessThan(attributePath, value),
    isLessThan: (value: NativeAttributeValue) => lessThan(attributePath, value),
    lessThanOrEquals: (value: NativeAttributeValue) =>
      lessThanOrEquals(attributePath, value),
    lte: (value: NativeAttributeValue) =>
      lessThanOrEquals(attributePath, value),
    isLessThanOrEquals: (value: NativeAttributeValue) =>
      lessThanOrEquals(attributePath, value),
    notEquals: (value: NativeAttributeValue) => notEquals(attributePath, value),
    ne: (value: NativeAttributeValue) => notEquals(attributePath, value),
    isNotEqualTo: (value: NativeAttributeValue) =>
      notEquals(attributePath, value),
    size: () => {
      return {
        between: (bounds: [NativeAttributeValue, NativeAttributeValue]) =>
          between(size(attributePath), bounds),
        isBetween: (bounds: [NativeAttributeValue, NativeAttributeValue]) =>
          between(size(attributePath), bounds),
        equals: (value: NativeAttributeValue) =>
          equals(size(attributePath), value),
        eq: (value: NativeAttributeValue) => equals(size(attributePath), value),
        isEqualTo: (value: NativeAttributeValue) =>
          equals(size(attributePath), value),
        greaterThan: (value: NativeAttributeValue) =>
          greaterThan(size(attributePath), value),
        gt: (value: NativeAttributeValue) =>
          greaterThan(size(attributePath), value),
        isGreaterThan: (value: NativeAttributeValue) =>
          greaterThan(size(attributePath), value),
        greaterThanOrEquals: (value: NativeAttributeValue) =>
          greaterThanOrEquals(size(attributePath), value),
        gte: (value: NativeAttributeValue) =>
          greaterThanOrEquals(size(attributePath), value),
        isGreaterThanOrEquals: (value: NativeAttributeValue) =>
          greaterThanOrEquals(size(attributePath), value),
        isIn: (
          values: {
            0: NativeAttributeValue;
          } & NativeAttributeValue[],
        ) => isIn(size(attributePath), values),
        in: (
          values: {
            0: NativeAttributeValue;
          } & NativeAttributeValue[],
        ) => isIn(size(attributePath), values),
        lessThan: (value: NativeAttributeValue) =>
          lessThan(size(attributePath), value),
        lt: (value: NativeAttributeValue) =>
          lessThan(size(attributePath), value),
        isLessThan: (value: NativeAttributeValue) =>
          lessThan(size(attributePath), value),
        lessThanOrEquals: (value: NativeAttributeValue) =>
          lessThanOrEquals(size(attributePath), value),
        lte: (value: NativeAttributeValue) =>
          lessThanOrEquals(size(attributePath), value),
        isLessThanOrEquals: (value: NativeAttributeValue) =>
          lessThanOrEquals(size(attributePath), value),
        notEquals: (value: NativeAttributeValue) =>
          notEquals(size(attributePath), value),
        ne: (value: NativeAttributeValue) =>
          notEquals(size(attributePath), value),
        isNotEqualTo: (value: NativeAttributeValue) =>
          notEquals(size(attributePath), value),
      };
    },
    isNullish: () => isNullish(attributePath),
    nullish: () => isNullish(attributePath),
    isFalsy: () => isFalsy(attributePath),
    falsy: () => isFalsy(attributePath),
    isTruthy: () => isTruthy(attributePath),
    truthy: () => isTruthy(attributePath),
  };
};

export const a = attribute;
export const an = attribute;
export const the = attribute;
