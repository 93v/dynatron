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
  conditions: conditions.reduce(
    (p: Condition[], c) => [...p, ...(Array.isArray(c) ? c : [c])],
    [],
  ),
});

export const attributeExists = (
  attributePath: string,
): AttributeExistsCondition => ({
  kind: "attribute_exists",
  attributePath,
});

export const attributeNotExists = (
  attributePath: string,
): AttributeNotExistsCondition => ({
  kind: "attribute_not_exists",
  attributePath,
});

export const attributeType = (
  attributePath: string,
  type: AttributeType,
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
    value: shortAttributeTypes[type],
  };
};

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
  ...arguments_: (Condition | Condition[])[]
): OrCondition => ({
  kind: "OR",
  conditions: arguments_.reduce(
    (p: Condition[], c) => [...p, ...(Array.isArray(c) ? c : [c])],
    [],
  ),
});

export const size = (attributePath: string): SizeCondition => ({
  kind: "size",
  attributePath,
});

export const isConditionEmptyDeep = (
  conditions: (Condition | Condition[] | undefined)[],
): boolean => {
  return conditions.every((argument) => {
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
};
