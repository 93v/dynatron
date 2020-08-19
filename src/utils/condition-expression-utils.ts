import {
  DocumentClient,
  ExpressionAttributeNameMap,
  ExpressionAttributeValueMap,
} from "aws-sdk/clients/dynamodb";

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
import { serializeAttributePath } from "./attribute-path-utils";
import { ExpressionKind } from "./constants";
import { assertNever, serializeExpressionValue } from "./misc-utils";

export const and = (...args: (Condition | Condition[])[]): AndCondition => ({
  kind: ExpressionKind.And,
  conditions: args.reduce(
    (p: Condition[], c) => [...p, ...(Array.isArray(c) ? c : [c])],
    [],
  ),
});

export const attributeExists = (path: string): AttributeExistsCondition => ({
  kind: ExpressionKind.AttributeExists,
  path,
});

export const attributeNotExists = (
  path: string,
): AttributeNotExistsCondition => ({
  kind: ExpressionKind.AttributeNotExists,
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
    kind: ExpressionKind.AttributeType,
    path,
    value: shortAttributeTypes[type],
  };
};

export const beginsWith = (
  path: string,
  substr: string,
): BeginsWithCondition => ({
  kind: ExpressionKind.BeginsWith,
  path,
  value: substr,
});

export const between = (
  path: string | SizeCondition,
  bounds: [DocumentClient.AttributeValue, DocumentClient.AttributeValue],
): BetweenCondition => ({
  kind: ExpressionKind.Between,
  path,
  values: bounds,
});

export const contains = (path: string, substr: string): ContainsCondition => ({
  kind: ExpressionKind.Contains,
  path,
  value: substr,
});

export const equals = (
  path: string | SizeCondition,
  value: DocumentClient.AttributeValue,
): EqualsCondition => ({
  kind: ExpressionKind.Equals,
  path,
  value,
});
export const eq = equals;

export const greaterThan = (
  path: string | SizeCondition,
  value: DocumentClient.AttributeValue,
): GreaterThanCondition => ({
  kind: ExpressionKind.GreaterThan,
  path,
  value,
});
export const gt = greaterThan;

export const greaterThanOrEquals = (
  path: string | SizeCondition,
  value: DocumentClient.AttributeValue,
): GreaterThanOrEqualsCondition => ({
  kind: ExpressionKind.GreaterThanOrEquals,
  path,
  value,
});
export const gte = greaterThanOrEquals;

export const isIn = (
  path: string | SizeCondition,
  values: DocumentClient.AttributeValue[],
): InCondition => ({
  kind: ExpressionKind.In,
  path,
  values,
});

export const lessThan = (
  path: string | SizeCondition,
  value: DocumentClient.AttributeValue,
): LessThanCondition => ({
  kind: ExpressionKind.LessThan,
  path,
  value,
});
export const lt = lessThan;

export const lessThanOrEquals = (
  path: string | SizeCondition,
  value: DocumentClient.AttributeValue,
): LessThanOrEqualsCondition => ({
  kind: ExpressionKind.LessThanOrEquals,
  path,
  value,
});
export const lte = lessThanOrEquals;

export const not = (condition: Condition): NotCondition => ({
  kind: ExpressionKind.Not,
  condition,
});

export const notEquals = (
  path: string | SizeCondition,
  value: DocumentClient.AttributeValue,
): NotEqualsCondition => ({
  kind: ExpressionKind.NotEquals,
  path,
  value,
});
export const ne = notEquals;

export const or = (...args: (Condition | Condition[])[]): OrCondition => ({
  kind: ExpressionKind.Or,
  conditions: args.reduce(
    (p: Condition[], c) => [...p, ...(Array.isArray(c) ? c : [c])],
    [],
  ),
});

export const size = (path: string): SizeCondition => ({
  kind: ExpressionKind.Size,
  path,
});

export const serializeConditionExpression = (
  condition: Condition,
  level = 0,
): {
  Expression: string;
  ExpressionAttributeNames: ExpressionAttributeNameMap;
  ExpressionAttributeValues?: ExpressionAttributeValueMap;
} => {
  switch (condition.kind) {
    case ExpressionKind.AttributeExists:
    case ExpressionKind.AttributeNotExists: {
      const aPath = serializeAttributePath(condition.path);
      return {
        Expression: `${condition.kind}(${aPath.expression})`,
        ExpressionAttributeNames: aPath.expressionAttributeNames,
      };
    }
    case ExpressionKind.AttributeType:
    case ExpressionKind.BeginsWith:
    case ExpressionKind.Contains: {
      const aPath = serializeAttributePath(condition.path);
      const aValue = serializeExpressionValue(condition.value);
      return {
        Expression: `${condition.kind}(${aPath.expression},${aValue.name})`,
        ExpressionAttributeNames: aPath.expressionAttributeNames,
        ExpressionAttributeValues: { [aValue.name]: aValue.value },
      };
    }
    case ExpressionKind.Between: {
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
        } ${aValues.map((v) => v.name).join(` ${ExpressionKind.And} `)}`,
        ExpressionAttributeNames: aPath.expressionAttributeNames,
        ExpressionAttributeValues: aValues.reduce(
          (p, c) => ({ ...p, [c.name]: c.value }),
          {},
        ),
      };
    }
    case ExpressionKind.Equals:
    case ExpressionKind.GreaterThan:
    case ExpressionKind.GreaterThanOrEquals:
    case ExpressionKind.LessThan:
    case ExpressionKind.LessThanOrEquals:
    case ExpressionKind.NotEquals: {
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
    case ExpressionKind.In: {
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
        }(${aValues.map((v) => v.name).join(",")})`,
        ExpressionAttributeNames: aPath.expressionAttributeNames,
        ExpressionAttributeValues: aValues.reduce(
          (p, c) => ({ ...p, [c.name]: c.value }),
          {},
        ),
      };
    }
    case ExpressionKind.Not: {
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
    case ExpressionKind.And:
    case ExpressionKind.Or: {
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
