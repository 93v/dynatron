// export type AttributeType =
//   | "binary"
//   | "binarySet"
//   | "boolean"
//   | "list"
//   | "map"
//   | "null"
//   | "number"
//   | "numberSet"
//   | "string"
//   | "stringSet";

// export type ExpressionKind =
//   | "AND"
//   | "attribute_exists"
//   | "attribute_not_exists"
//   | "attribute_type"
//   | "begins_with"
//   | "BETWEEN"
//   | "contains"
//   | "="
//   | ">"
//   | ">="
//   | "IN"
//   | "<"
//   | "<="
//   | "NOT"
//   | "<>"
//   | "OR"
//   | "size";

// interface IConditionExpression {
//   kind: ExpressionKind;
// }

// export interface AndCondition extends IConditionExpression {
//   kind: "AND";
//   conditions: Condition[];
// }

// export interface AttributeExistsCondition extends IConditionExpression {
//   kind: "attribute_exists";
//   path: string;
// }

// export interface AttributeNotExistsCondition extends IConditionExpression {
//   kind: "attribute_not_exists";
//   path: string;
// }

// export interface AttributeTypeCondition extends IConditionExpression {
//   path: string;
//   kind: "attribute_type";
//   value: string;
// }

// export interface BeginsWithCondition extends IConditionExpression {
//   path: string;
//   kind: "begins_with";
//   value: string;
// }

// export interface BetweenCondition extends IConditionExpression {
//   path: string | SizeCondition;
//   kind: "BETWEEN";
//   values: [any, any];
// }

// export interface ContainsCondition extends IConditionExpression {
//   path: string;
//   kind: "contains";
//   value: string;
// }

// export interface EqualsCondition extends IConditionExpression {
//   path: string | SizeCondition;
//   kind: "=";
//   value: any;
// }

// export interface GreaterThanCondition extends IConditionExpression {
//   path: string | SizeCondition;
//   kind: ">";
//   value: any;
// }

// export interface GreaterThanOrEqualsCondition extends IConditionExpression {
//   path: string | SizeCondition;
//   kind: ">=";
//   value: any;
// }

// export interface InCondition extends IConditionExpression {
//   path: string | SizeCondition;
//   kind: "IN";
//   values: any[];
// }

// export interface LessThanCondition extends IConditionExpression {
//   path: string | SizeCondition;
//   kind: "<";
//   value: any;
// }

// export interface LessThanOrEqualsCondition extends IConditionExpression {
//   path: string | SizeCondition;
//   kind: "<=";
//   value: any;
// }

// export interface NotCondition extends IConditionExpression {
//   kind: "NOT";
//   condition: Condition;
// }

// export interface NotEqualsCondition extends IConditionExpression {
//   path: string | SizeCondition;
//   kind: "<>";
//   value: any;
// }

// export interface OrCondition extends IConditionExpression {
//   kind: "OR";
//   conditions: Condition[];
// }

// export interface SizeCondition extends IConditionExpression {
//   path: string;
//   kind: "size";
// }

// type KeyCondition =
//   | BeginsWithCondition
//   | BetweenCondition
//   | EqualsCondition
//   | GreaterThanCondition
//   | GreaterThanOrEqualsCondition
//   | LessThanCondition
//   | LessThanOrEqualsCondition;

// type NonKeyCondition =
//   | AndCondition
//   | AttributeExistsCondition
//   | AttributeNotExistsCondition
//   | AttributeTypeCondition
//   | ContainsCondition
//   | InCondition
//   | NotCondition
//   | NotEqualsCondition
//   | OrCondition;

// export type Condition = KeyCondition | NonKeyCondition;
