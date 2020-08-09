import {
  BooleanObject,
  ClientRequestToken,
  ConsistentRead,
  DocumentClient,
  ExpressionAttributeNameMap,
  ExpressionAttributeValueMap,
  IndexName,
  PositiveIntegerObject,
  ScanTotalSegments,
  TransactGetItemList,
  TransactWriteItemList,
} from "aws-sdk/clients/dynamodb";

import { Condition, KeyCondition } from "./conditions";
import { Update } from "./update";

export type ReturnItemCollectionMetrics = "SIZE" | "NONE";
export type ReturnConsumedCapacity = "INDEXES" | "TOTAL" | "NONE";

export interface IBatchDeleteItemRequestItem {
  DeleteRequest: { Key: DocumentClient.Key };
}

export interface IBatchGetItemRequestItem {
  ConsistentRead?: ConsistentRead;
  ExpressionAttributeNames?: ExpressionAttributeNameMap;
  Keys: DocumentClient.Key[];
  ProjectionExpression?: string;
}

export interface IBatchPutItemRequestItem {
  PutRequest: { Item: DocumentClient.PutItemInputAttributeMap };
}

export interface RequestParams {
  ClientRequestToken?: ClientRequestToken;
  ConditionExpression?: string;
  ConsistentRead?: ConsistentRead;
  ExclusiveStartKey?: DocumentClient.Key;
  ExpressionAttributeNames?: ExpressionAttributeNameMap;
  ExpressionAttributeValues?: ExpressionAttributeValueMap;
  FilterExpression?: string;
  IndexName?: IndexName;
  Item?: DocumentClient.PutItemInputAttributeMap;
  Key?: DocumentClient.Key;
  KeyConditionExpression?: string;
  Limit?: PositiveIntegerObject;
  ProjectionExpression?: string;
  RawConditionExpression?: Condition[];
  RawFilterExpression?: Condition[];
  RawKeyConditionExpression?: KeyCondition[];
  RawProjectionExpression?: string[];
  RawUpdateExpression?: Update[];
  RequestItems?: Record<
    string,
    | IBatchGetItemRequestItem
    | IBatchDeleteItemRequestItem[]
    | IBatchPutItemRequestItem[]
  >;
  ReturnConsumedCapacity?: ReturnConsumedCapacity;
  ReturnItemCollectionMetrics?: ReturnItemCollectionMetrics;
  ReturnValues?: FullReturnValues;
  ReturnValuesOnConditionCheckFailure?: FullReturnValues;
  ScanIndexForward?: BooleanObject;
  TotalSegments?: ScanTotalSegments;
  TransactItems?: TransactGetItemList | TransactWriteItemList;
  UpdateExpression?: string;
}

export type ReturnValues = "ALL_OLD" | "NONE";

export type FullReturnValues =
  | ReturnValues
  | "ALL_NEW"
  | "UPDATED_NEW"
  | "UPDATED_OLD";

interface ConnectionTimeout {
  timeout?: number;
}

interface DirectConnection extends ConnectionTimeout {
  mode: "direct";
  profile: string;
  region: string;
}

interface LocalhostConnection {
  mode: "localhost";
  accessKeyId?: string;
  secretAccessKey?: string;
  host?: string;
  port?: number;
  profile?: string;
}

export type DynatronDocumentClientParams =
  | DirectConnection
  | LocalhostConnection;

export interface DynatronConstructorParams {
  table: string;
  clientConfigs?: DynatronDocumentClientParams;
}

type AttributeName = {
  type: "AttributeName";
  name: string;
};

export type ListIndex = {
  type: "ListIndex";
  index: number;
};

export type PathElement = AttributeName | ListIndex;
