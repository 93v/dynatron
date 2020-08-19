import { Options } from "async-retry";

export const BUILD: unique symbol = Symbol("Build._build");
export const BUILD_PARAMS: unique symbol = Symbol("BuildParams._buildParams");

export const enum ExpressionKind {
  And = "AND",
  AttributeExists = "attribute_exists",
  AttributeNotExists = "attribute_not_exists",
  AttributeType = "attribute_type",
  BeginsWith = "begins_with",
  Between = "BETWEEN",
  Contains = "contains",
  Equals = "=",
  GreaterThan = ">",
  GreaterThanOrEquals = ">=",
  In = "IN",
  LessThan = "<",
  LessThanOrEquals = "<=",
  Not = "NOT",
  NotEquals = "<>",
  Or = "OR",
  Size = "size",
}

export const enum AttributeTypesEnum {
  Binary = "B",
  BinarySet = "BS",
  Boolean = "BOOL",
  List = "L",
  Map = "M",
  Null = "NULL",
  Number = "N",
  NumberSet = "NS",
  String = "S",
  StringSet = "SS",
}

export const MILLISECONDS_IN_SECOND = 1000;

export const TAKING_TOO_LONG_EXCEPTION = "TakingTooLongException";

export const BATCH_OPTIONS = {
  WRITE_LIMIT: 25,
  GET_LIMIT: 100,
};

export const RETRY_OPTIONS: Options = {
  minTimeout: 50,
  retries: 5,
};

export const SHORT_MAX_LATENCY = MILLISECONDS_IN_SECOND;
export const LONG_MAX_LATENCY = 10 * MILLISECONDS_IN_SECOND;
