import { DocumentClient } from "aws-sdk/lib/dynamodb/document_client";

import { AttributeTypesEnum, ExpressionKind } from "../src/utils/constants";

export interface AndCondition {
  kind: ExpressionKind.And;
  conditions: Condition[];
}

export interface AttributeExistsCondition {
  kind: ExpressionKind.AttributeExists;
  path: string;
}

export interface AttributeNotExistsCondition {
  kind: ExpressionKind.AttributeNotExists;
  path: string;
}

export interface AttributeTypeCondition {
  path: string;
  kind: ExpressionKind.AttributeType;
  value: AttributeTypesEnum;
}

export interface BeginsWithCondition {
  path: string;
  kind: ExpressionKind.BeginsWith;
  value: string;
}

export interface BetweenCondition {
  path: string | SizeCondition;
  kind: ExpressionKind.Between;
  values: [DocumentClient.AttributeValue, DocumentClient.AttributeValue];
}

export interface ContainsCondition {
  path: string;
  kind: ExpressionKind.Contains;
  value: string;
}

export interface EqualsCondition {
  path: string | SizeCondition;
  kind: ExpressionKind.Equals;
  value: DocumentClient.AttributeValue;
}

export interface GreaterThanCondition {
  path: string | SizeCondition;
  kind: ExpressionKind.GreaterThan;
  value: DocumentClient.AttributeValue;
}

export interface GreaterThanOrEqualsCondition {
  path: string | SizeCondition;
  kind: ExpressionKind.GreaterThanOrEquals;
  value: DocumentClient.AttributeValue;
}

export interface InCondition {
  path: string | SizeCondition;
  kind: ExpressionKind.In;
  values: DocumentClient.AttributeValue[];
}

export interface LessThanCondition {
  path: string | SizeCondition;
  kind: ExpressionKind.LessThan;
  value: DocumentClient.AttributeValue;
}

export interface LessThanOrEqualsCondition {
  path: string | SizeCondition;
  kind: ExpressionKind.LessThanOrEquals;
  value: DocumentClient.AttributeValue;
}

export interface NotCondition {
  kind: ExpressionKind.Not;
  condition: Condition;
}

export interface NotEqualsCondition {
  path: string | SizeCondition;
  kind: ExpressionKind.NotEquals;
  value: DocumentClient.AttributeValue;
}

export interface OrCondition {
  kind: ExpressionKind.Or;
  conditions: Condition[];
}

export interface SizeCondition {
  path: string;
  kind: ExpressionKind.Size;
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
