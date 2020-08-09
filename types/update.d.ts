import {
  AttributeMap,
  BooleanObject,
  ExpressionAttributeNameMap,
  ExpressionAttributeValueMap,
} from "aws-sdk/clients/dynamodb";
import { DocumentClient } from "aws-sdk/lib/dynamodb/document_client";

import { UpdateKind } from "../src/utils/constants";

export interface UpdateAdd {
  kind: UpdateKind.Add;
  path: string;
  value: DocumentClient.DynamoDbSet | number;
}

export interface UpdateAppend {
  kind: UpdateKind.Append;
  path: string;
  value: DocumentClient.AttributeValue | DocumentClient.AttributeValue[];
}

export interface UpdateAssign {
  kind: UpdateKind.Assign;
  item: AttributeMap;
}

export interface UpdateDecrement {
  kind: UpdateKind.Decrement;
  path: string;
  value: number;
}

export interface UpdateDelete {
  kind: UpdateKind.Delete;
  path: string;
  value: DocumentClient.DynamoDbSet;
}

export interface UpdateIncrement {
  kind: UpdateKind.Increment;
  path: string;
  value: number;
}

export interface UpdatePrepend {
  kind: UpdateKind.Prepend;
  path: string;
  value: DocumentClient.AttributeValue | DocumentClient.AttributeValue[];
}

export interface UpdateRemove {
  kind: UpdateKind.Remove;
  path: string;
}

export interface UpdateSet {
  kind: UpdateKind.Set;
  path: string;
  value: DocumentClient.AttributeValue;
  ifNotExist: BooleanObject;
}

export type Update =
  | UpdateAdd
  | UpdateAppend
  | UpdateDecrement
  | UpdateDelete
  | UpdateIncrement
  | UpdatePrepend
  | UpdateRemove
  | UpdateSet;

export type RawUpdateType = "SET" | "ADD" | "REMOVE" | "DELETE";

export interface RawUpdate {
  Expression: string;
  ExpressionAttributeNames: ExpressionAttributeNameMap;
  ExpressionAttributeValues?: ExpressionAttributeValueMap;
}
