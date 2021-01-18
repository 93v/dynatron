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

export const attributeExists = (path: string): AttributeExistsCondition => ({
  kind: "attribute_exists",
  path,
});

export const attributeNotExists = (
  path: string,
): AttributeNotExistsCondition => ({
  kind: "attribute_not_exists",
  path,
});

export const attributeType = (
  path: string,
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
    path,
    value: shortAttributeTypes[type],
  };
};

export const beginsWith = (
  path: string,
  substr: string,
): BeginsWithCondition => ({
  kind: "begins_with",
  path,
  value: substr,
});

export const between = (
  path: string | SizeCondition,
  bounds: [NativeAttributeValue, NativeAttributeValue],
): BetweenCondition => ({
  kind: "BETWEEN",
  path,
  values: bounds,
});

export const contains = (path: string, substr: string): ContainsCondition => ({
  kind: "contains",
  path,
  value: substr,
});

export const equals = (
  path: string | SizeCondition,
  value: NativeAttributeValue,
): EqualsCondition => ({
  kind: "=",
  path,
  value,
});
export const eq = equals;

export const greaterThan = (
  path: string | SizeCondition,
  value: NativeAttributeValue,
): GreaterThanCondition => ({
  kind: ">",
  path,
  value,
});
export const gt = greaterThan;

export const greaterThanOrEquals = (
  path: string | SizeCondition,
  value: NativeAttributeValue,
): GreaterThanOrEqualsCondition => ({
  kind: ">=",
  path,
  value,
});
export const gte = greaterThanOrEquals;

export const isIn = (
  path: string | SizeCondition,
  values: {
    0: NativeAttributeValue;
  } & NativeAttributeValue[],
): InCondition => ({
  kind: "IN",
  path,
  values,
});

export const lessThan = (
  path: string | SizeCondition,
  value: NativeAttributeValue,
): LessThanCondition => ({
  kind: "<",
  path,
  value,
});
export const lt = lessThan;

export const lessThanOrEquals = (
  path: string | SizeCondition,
  value: NativeAttributeValue,
): LessThanOrEqualsCondition => ({
  kind: "<=",
  path,
  value,
});
export const lte = lessThanOrEquals;

export const not = (condition: Condition): NotCondition => ({
  kind: "NOT",
  condition,
});

export const notEquals = (
  path: string | SizeCondition,
  value: NativeAttributeValue,
): NotEqualsCondition => ({
  kind: "<>",
  path,
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

export const size = (path: string): SizeCondition => ({
  kind: "size",
  path,
});

export const serializeConditionExpression = (
  condition: Condition,
  level = 0,
): {
  Expression: string;
  ExpressionAttributeNames: Record<string, string>;
  ExpressionAttributeValues?: NativeValue;
} => {
  switch (condition.kind) {
    case "attribute_exists":
    case "attribute_not_exists": {
      const aPath = serializeAttributePath(condition.path);
      return {
        Expression: `${condition.kind}(${aPath.expression})`,
        ExpressionAttributeNames: aPath.expressionAttributeNames,
      };
    }
    case "attribute_type":
    case "begins_with":
    case "contains": {
      const aPath = serializeAttributePath(condition.path);
      const aValue = serializeExpressionValue(condition.value);
      return {
        Expression: `${condition.kind}(${aPath.expression},${aValue.name})`,
        ExpressionAttributeNames: aPath.expressionAttributeNames,
        ExpressionAttributeValues: { [aValue.name]: aValue.value },
      };
    }
    case "BETWEEN": {
      const path =
        typeof condition.path === "string"
          ? condition.path
          : condition.path.path;
      const aPath = serializeAttributePath(path);
      const aValues = condition.values.map((value) =>
        serializeExpressionValue(value),
      );
      return {
        Expression: `${typeof condition.path !== "string" ? "size(" : ""}${
          aPath.expression
        }${typeof condition.path !== "string" ? ")" : ""} ${
          condition.kind
        } ${aValues
          .map((v) => v.name)
          .filter((t) => t.trim() !== "")
          .join(` AND `)}`,
        ExpressionAttributeNames: aPath.expressionAttributeNames,
        ExpressionAttributeValues: aValues.reduce(
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
        typeof condition.path === "string"
          ? condition.path
          : condition.path.path;
      const aPath = serializeAttributePath(path);
      const aValue = serializeExpressionValue(condition.value);
      return {
        Expression: `${typeof condition.path !== "string" ? "size(" : ""}${
          aPath.expression
        }${typeof condition.path !== "string" ? ")" : ""}${condition.kind}${
          aValue.name
        }`,
        ExpressionAttributeNames: aPath.expressionAttributeNames,
        ExpressionAttributeValues: { [aValue.name]: aValue.value },
      };
    }
    case "IN": {
      const path =
        typeof condition.path === "string"
          ? condition.path
          : condition.path.path;
      const aPath = serializeAttributePath(path);
      const aValues = condition.values.map((value) =>
        serializeExpressionValue(value),
      );
      return {
        Expression: `${typeof condition.path !== "string" ? "size(" : ""}${
          aPath.expression
        }${typeof condition.path !== "string" ? ")" : ""} ${
          condition.kind
        }(${aValues
          .map((v) => v.name)
          // .filter((t) => t.trim() !== "")
          .join(",")})`,
        ExpressionAttributeNames: aPath.expressionAttributeNames,
        ExpressionAttributeValues: aValues.reduce(
          (p, c) => ({ ...p, [c.name]: c.value }),
          {},
        ),
      };
    }
    case "NOT": {
      const serialized = serializeConditionExpression(
        condition.condition,
        level + 1,
      );
      return {
        Expression: `(${condition.kind} ${serialized.Expression})`,
        ExpressionAttributeNames: serialized.ExpressionAttributeNames,
        ExpressionAttributeValues: serialized.ExpressionAttributeValues,
      };
    }
    case "AND":
    case "OR": {
      const serializedConditions = condition.conditions.map((c) =>
        serializeConditionExpression(
          c,
          level + condition.conditions.length - 1,
        ),
      );
      return {
        Expression: `${
          condition.conditions.length > 1 && level > 0 ? "(" : ""
        }${serializedConditions
          .map((c) => c.Expression)
          .filter((t) => t.trim() !== "")
          .join(` ${condition.kind} `)}${
          condition.conditions.length > 1 && level > 0 ? ")" : ""
        }`,
        ExpressionAttributeNames: serializedConditions.reduce(
          (p, c) => ({
            ...p,
            ...c.ExpressionAttributeNames,
          }),
          {},
        ),
        ExpressionAttributeValues: serializedConditions.reduce(
          (p, c) => ({
            ...p,
            ...c.ExpressionAttributeValues,
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
