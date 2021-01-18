import {
  ReturnConsumedCapacity,
  ReturnItemCollectionMetrics,
  ReturnValue,
} from "@aws-sdk/client-dynamodb";

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
  // ExclusiveStartKey?: NativeKey;
  ExpressionAttributeNames?: Record<string, string>;
  // ExpressionAttributeValues?: ExpressionAttributeValueMap;
  FilterExpression?: string;
  IndexName?: string;
  _Item?: NativeValue;
  _Key?: NativeKey;
  KeyConditionExpression?: string;
  Limit?: number;
  ProjectionExpression?: string;
  // RawConditionExpression?: Condition[];
  // RawFilterExpression?: Condition[];
  // RawKeyConditionExpression?: KeyCondition[];
  RawProjectionExpression?: string[];
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
  TotalSegments?: number;
  // TransactItems?: TransactGetItemList | TransactWriteItemList;
  UpdateExpression?: string;
};
