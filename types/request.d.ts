import {
  ReturnConsumedCapacity,
  ReturnItemCollectionMetrics,
  ReturnValue,
} from "@aws-sdk/client-dynamodb";

import { AndCondition, Condition } from "./conditions";
import { NativeKey, NativeValue } from "./native-types";

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
  ClientRequestToken?: string;
  ConditionExpression?: string;
  ConsistentRead?: boolean;
  ExpressionAttributeNames?: Record<string, string>;
  ExpressionAttributeValues?: NativeValue;
  _FilterExpressions?: Condition[];
  IndexName?: string;
  _Item?: NativeValue;
  _Key?: NativeKey;
  _ExclusiveStartKey?: NativeKey;
  Limit?: number;
  _ProjectionExpressions?: string[];
  // RawConditionExpression?: Condition[];
  _KeyConditionExpression?: AndCondition;
  // RawUpdateExpression?: Update[];
  // RequestItems?: Record<
  //   string,
  //   | IBatchGetItemRequestItem
  //   | IBatchDeleteItemRequestItem[]
  //   | IBatchPutItemRequestItem[]
  // >;
  ReturnConsumedCapacity?: ReturnConsumedCapacity;
  ReturnItemCollectionMetrics?: ReturnItemCollectionMetrics;
  ReturnValues?: ReturnValue;
  ReturnValuesOnConditionCheckFailure?: ReturnValue;
  ScanIndexForward?: boolean;
  TableName?: string;
  Segment?: number;
  TotalSegments?: number;
  // TransactItems?: TransactGetItemList | TransactWriteItemList;
  UpdateExpression?: string;
};
