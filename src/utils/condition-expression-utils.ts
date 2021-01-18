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
} from "../../types/conditions";
import { NativeValue } from "../../types/native-types";
import { serializeAttributePath } from "./attribute-path-serializer";
import { assertNever, serializeExpressionValue } from "./misc-utils";

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
  attributePath: attributePath,
});

export const attributeNotExists = (
  attributePath: string,
): AttributeNotExistsCondition => ({
  kind: "attribute_not_exists",
  attributePath: attributePath,
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
    attributePath: attributePath,
    value: shortAttributeTypes[type],
  };
};

export const beginsWith = (
  attributePath: string,
  substr: string,
): BeginsWithCondition => ({
  kind: "begins_with",
  attributePath: attributePath,
  value: substr,
});

export const between = (
  attributePath: string | SizeCondition,
  bounds: [NativeAttributeValue, NativeAttributeValue],
): BetweenCondition => ({
  kind: "BETWEEN",
  attributePath: attributePath,
  values: bounds,
});

export const contains = (
  attributePath: string,
  substr: string,
): ContainsCondition => ({
  kind: "contains",
  attributePath: attributePath,
  value: substr,
});

export const equals = (
  attributePath: string | SizeCondition,
  value: NativeAttributeValue,
): EqualsCondition => ({
  kind: "=",
  attributePath: attributePath,
  value,
});
export const eq = equals;

export const greaterThan = (
  attributePath: string | SizeCondition,
  value: NativeAttributeValue,
): GreaterThanCondition => ({
  kind: ">",
  attributePath: attributePath,
  value,
});
export const gt = greaterThan;

export const greaterThanOrEquals = (
  attributePath: string | SizeCondition,
  value: NativeAttributeValue,
): GreaterThanOrEqualsCondition => ({
  kind: ">=",
  attributePath: attributePath,
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
  attributePath: attributePath,
  values,
});

export const lessThan = (
  attributePath: string | SizeCondition,
  value: NativeAttributeValue,
): LessThanCondition => ({
  kind: "<",
  attributePath: attributePath,
  value,
});
export const lt = lessThan;

export const lessThanOrEquals = (
  attributePath: string | SizeCondition,
  value: NativeAttributeValue,
): LessThanOrEqualsCondition => ({
  kind: "<=",
  attributePath: attributePath,
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
  attributePath: attributePath,
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
  attributePath: attributePath,
});

export const serializeConditionExpression = (
  condition: Condition,
  prefix = "",
  level = 0,
): {
  expressionString: string;
  expressionAttributeNames: Record<string, string>;
  expressionAttributeValues?: NativeValue;
} => {
  switch (condition.kind) {
    case "attribute_exists":
    case "attribute_not_exists": {
      const aPath = serializeAttributePath(condition.attributePath, prefix);
      return {
        expressionString: `${condition.kind}(${aPath.expression})`,
        expressionAttributeNames: aPath.expressionAttributeNames,
      };
    }
    case "attribute_type":
    case "begins_with":
    case "contains": {
      const aPath = serializeAttributePath(condition.attributePath, prefix);
      const aValue = serializeExpressionValue(condition.value, prefix);
      return {
        expressionString: `${condition.kind}(${aPath.expression},${aValue.name})`,
        expressionAttributeNames: aPath.expressionAttributeNames,
        expressionAttributeValues: { [aValue.name]: aValue.value },
      };
    }
    case "BETWEEN": {
      const path =
        typeof condition.attributePath === "string"
          ? condition.attributePath
          : condition.attributePath.attributePath;
      const aPath = serializeAttributePath(path, prefix);
      const aValues = condition.values.map((value) =>
        serializeExpressionValue(value, prefix),
      );
      return {
        expressionString: `${
          typeof condition.attributePath !== "string" ? "size(" : ""
        }${aPath.expression}${
          typeof condition.attributePath !== "string" ? ")" : ""
        } ${condition.kind} ${aValues
          .map((v) => v.name)
          .filter((t) => t.trim() !== "")
          .join(` AND `)}`,
        expressionAttributeNames: aPath.expressionAttributeNames,
        expressionAttributeValues: aValues.reduce(
          (p, c) => ({ ...p, [c.name]: c.value }),
          {},
        ),
      };
    }
    case "=":
    case ">":
    case ">=":
    case "<":
    case "<=":
    case "<>": {
      const path =
        typeof condition.attributePath === "string"
          ? condition.attributePath
          : condition.attributePath.attributePath;
      const aPath = serializeAttributePath(path, prefix);
      const aValue = serializeExpressionValue(condition.value, prefix);
      return {
        expressionString: `${
          typeof condition.attributePath !== "string" ? "size(" : ""
        }${aPath.expression}${
          typeof condition.attributePath !== "string" ? ")" : ""
        }${condition.kind}${aValue.name}`,
        expressionAttributeNames: aPath.expressionAttributeNames,
        expressionAttributeValues: { [aValue.name]: aValue.value },
      };
    }
    case "IN": {
      const path =
        typeof condition.attributePath === "string"
          ? condition.attributePath
          : condition.attributePath.attributePath;
      const aPath = serializeAttributePath(path, prefix);
      const aValues = condition.values.map((value) =>
        serializeExpressionValue(value, prefix),
      );
      return {
        expressionString: `${
          typeof condition.attributePath !== "string" ? "size(" : ""
        }${aPath.expression}${
          typeof condition.attributePath !== "string" ? ")" : ""
        } ${condition.kind}(${aValues
          .map((v) => v.name)
          // .filter((t) => t.trim() !== "")
          .join(",")})`,
        expressionAttributeNames: aPath.expressionAttributeNames,
        expressionAttributeValues: aValues.reduce(
          (p, c) => ({ ...p, [c.name]: c.value }),
          {},
        ),
      };
    }
    case "NOT": {
      const serialized = serializeConditionExpression(
        condition.condition,
        prefix,
        level + 1,
      );
      return {
        expressionString: `(${condition.kind} ${serialized.expressionString})`,
        expressionAttributeNames: serialized.expressionAttributeNames,
        expressionAttributeValues: serialized.expressionAttributeValues,
      };
    }
    case "AND":
    case "OR": {
      const serializedConditions = condition.conditions.map((c) =>
        serializeConditionExpression(
          c,
          prefix,
          level + condition.conditions.length - 1,
        ),
      );
      return {
        expressionString: `${
          condition.conditions.length > 1 && level > 0 ? "(" : ""
        }${serializedConditions
          .map((c) => c.expressionString)
          .filter((t) => t.trim() !== "")
          .join(` ${condition.kind} `)}${
          condition.conditions.length > 1 && level > 0 ? ")" : ""
        }`,
        expressionAttributeNames: serializedConditions.reduce(
          (p, c) => ({
            ...p,
            ...c.expressionAttributeNames,
          }),
          {},
        ),
        expressionAttributeValues: serializedConditions.reduce(
          (p, c) => ({
            ...p,
            ...c.expressionAttributeValues,
          }),
          {},
        ),
      };
    }
    default:
      throw assertNever(condition);
  }
};

export const isConditionEmptyDeep = (
  arguments_: (Condition | Condition[] | undefined)[],
): boolean => {
  return arguments_.every((argument) => {
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
