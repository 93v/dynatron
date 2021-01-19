import {
  ReturnConsumedCapacity,
  ReturnItemCollectionMetrics,
  ReturnValue,
} from "@aws-sdk/client-dynamodb";

import { AndCondition, Condition } from "./conditions";
import { NativeKey, NativeValue } from "./native-types";
import { UpdateType } from "./update";

type AttributeName = {
  type: "AttributeName";
  name: string;
};

export type ListIndex = {
  type: "ListIndex";
  index: number;
};

export type PathElement = AttributeName | ListIndex;

export type RequestParameters = {
  _FilterExpressions?: Condition[];
  _Item?: NativeValue;
  _Items?: NativeValue[];
  _Key?: NativeKey;
  _Keys?: NativeKey[];
  _ExclusiveStartKey?: NativeKey;
  _ProjectionExpressions?: string[];
  _ConditionExpressions?: Condition[];
  _KeyConditionExpression?: AndCondition;
  _UpdateExpressions?: UpdateType[];
  ClientRequestToken?: string;
  ConditionExpression?: string;
  ConsistentRead?: boolean;
  ExpressionAttributeNames?: Record<string, string>;
  ExpressionAttributeValues?: NativeValue;
  IndexName?: string;
  Limit?: number;
  ReturnConsumedCapacity?: ReturnConsumedCapacity;
  ReturnItemCollectionMetrics?: ReturnItemCollectionMetrics;
  ReturnValues?: ReturnValue;
  ReturnValuesOnConditionCheckFailure?: ReturnValue;
  ScanIndexForward?: boolean;
  TableName?: string;
  Segment?: number;
  TotalSegments?: number;
  // RequestItems?: Record<
  //   string,
  //   | IBatchGetItemRequestItem
  //   | IBatchDeleteItemRequestItem[]
  //   | IBatchPutItemRequestItem[]
  // >;
  // TransactItems?: TransactGetItemList | TransactWriteItemList;
};
