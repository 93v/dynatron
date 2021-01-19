import { NativeAttributeValue } from "@aws-sdk/util-dynamodb";

export type AttributeType =
  | "binary"
  | "binarySet"
  | "boolean"
  | "list"
  | "map"
  | "null"
  | "number"
  | "numberSet"
  | "string"
  | "stringSet";

export type ExpressionKind =
  | "AND"
  | "attribute_exists"
  | "attribute_not_exists"
  | "attribute_type"
  | "begins_with"
  | "BETWEEN"
  | "contains"
  | "="
  | ">"
  | ">="
  | "IN"
  | "<"
  | "<="
  | "NOT"
  | "<>"
  | "OR"
  | "size";

type ConditionExpression = {
  kind: ExpressionKind;
};

export type AndCondition = ConditionExpression & {
  kind: "AND";
  conditions: Condition[];
};

export type AttributeExistsCondition = ConditionExpression & {
  kind: "attribute_exists";
  attributePath: string;
};

export type AttributeNotExistsCondition = ConditionExpression & {
  kind: "attribute_not_exists";
  attributePath: string;
};

export type AttributeTypeCondition = ConditionExpression & {
  attributePath: string;
  kind: "attribute_type";
  value: string;
};

export type BeginsWithCondition = ConditionExpression & {
  attributePath: string;
  kind: "begins_with";
  value: string;
};

export type BetweenCondition = ConditionExpression & {
  attributePath: string | SizeCondition;
  kind: "BETWEEN";
  values: [NativeAttributeValue, NativeAttributeValue];
};

export type ContainsCondition = ConditionExpression & {
  attributePath: string;
  kind: "contains";
  value: string;
};

export type EqualsCondition = ConditionExpression & {
  attributePath: string | SizeCondition;
  kind: "=";
  value: NativeAttributeValue;
};

export type GreaterThanCondition = ConditionExpression & {
  attributePath: string | SizeCondition;
  kind: ">";
  value: NativeAttributeValue;
};

export type GreaterThanOrEqualsCondition = ConditionExpression & {
  attributePath: string | SizeCondition;
  kind: ">=";
  value: NativeAttributeValue;
};

export type InCondition = ConditionExpression & {
  attributePath: string | SizeCondition;
  kind: "IN";
  values: NativeAttributeValue[];
};

export type LessThanCondition = ConditionExpression & {
  attributePath: string | SizeCondition;
  kind: "<";
  value: NativeAttributeValue;
};

export type LessThanOrEqualsCondition = ConditionExpression & {
  attributePath: string | SizeCondition;
  kind: "<=";
  value: NativeAttributeValue;
};

export type NotCondition = ConditionExpression & {
  kind: "NOT";
  condition: Condition;
};

export type NotEqualsCondition = ConditionExpression & {
  attributePath: string | SizeCondition;
  kind: "<>";
  value: NativeAttributeValue;
};

export type OrCondition = ConditionExpression & {
  kind: "OR";
  conditions: Condition[];
};

export type SizeCondition = ConditionExpression & {
  attributePath: string;
  kind: "size";
};

export type KeyCondition =
  | BeginsWithCondition
  | BetweenCondition
  | EqualsCondition
  | GreaterThanCondition
  | GreaterThanOrEqualsCondition
  | LessThanCondition
  | LessThanOrEqualsCondition;

export type Condition =
  | KeyCondition
  | AndCondition
  | AttributeExistsCondition
  | AttributeNotExistsCondition
  | AttributeTypeCondition
  | ContainsCondition
  | InCondition
  | NotCondition
  | NotEqualsCondition
  | OrCondition;
