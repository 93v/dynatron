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

interface IConditionExpression {
  kind: ExpressionKind;
}

export interface AndCondition extends IConditionExpression {
  kind: "AND";
  conditions: Condition[];
}

export interface AttributeExistsCondition extends IConditionExpression {
  kind: "attribute_exists";
  attributePath: string;
}

export interface AttributeNotExistsCondition extends IConditionExpression {
  kind: "attribute_not_exists";
  attributePath: string;
}

export interface AttributeTypeCondition extends IConditionExpression {
  attributePath: string;
  kind: "attribute_type";
  value: string;
}

export interface BeginsWithCondition extends IConditionExpression {
  attributePath: string;
  kind: "begins_with";
  value: string;
}

export interface BetweenCondition extends IConditionExpression {
  attributePath: string | SizeCondition;
  kind: "BETWEEN";
  values: [NativeAttributeValue, NativeAttributeValue];
}

export interface ContainsCondition extends IConditionExpression {
  attributePath: string;
  kind: "contains";
  value: string;
}

export interface EqualsCondition extends IConditionExpression {
  attributePath: string | SizeCondition;
  kind: "=";
  value: NativeAttributeValue;
}

export interface GreaterThanCondition extends IConditionExpression {
  attributePath: string | SizeCondition;
  kind: ">";
  value: NativeAttributeValue;
}

export interface GreaterThanOrEqualsCondition extends IConditionExpression {
  attributePath: string | SizeCondition;
  kind: ">=";
  value: NativeAttributeValue;
}

export interface InCondition extends IConditionExpression {
  attributePath: string | SizeCondition;
  kind: "IN";
  values: NativeAttributeValue[];
}

export interface LessThanCondition extends IConditionExpression {
  attributePath: string | SizeCondition;
  kind: "<";
  value: NativeAttributeValue;
}

export interface LessThanOrEqualsCondition extends IConditionExpression {
  attributePath: string | SizeCondition;
  kind: "<=";
  value: NativeAttributeValue;
}

export interface NotCondition extends IConditionExpression {
  kind: "NOT";
  condition: Condition;
}

export interface NotEqualsCondition extends IConditionExpression {
  attributePath: string | SizeCondition;
  kind: "<>";
  value: NativeAttributeValue;
}

export interface OrCondition extends IConditionExpression {
  kind: "OR";
  conditions: Condition[];
}

export interface SizeCondition extends IConditionExpression {
  attributePath: string;
  kind: "size";
}

type KeyCondition =
  | BeginsWithCondition
  | BetweenCondition
  | EqualsCondition
  | GreaterThanCondition
  | GreaterThanOrEqualsCondition
  | LessThanCondition
  | LessThanOrEqualsCondition;

type NonKeyCondition =
  | AndCondition
  | AttributeExistsCondition
  | AttributeNotExistsCondition
  | AttributeTypeCondition
  | ContainsCondition
  | InCondition
  | NotCondition
  | NotEqualsCondition
  | OrCondition;

export type Condition = KeyCondition | NonKeyCondition;
