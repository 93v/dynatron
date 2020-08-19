import {
  AttributeMap,
  BooleanObject,
  ExpressionAttributeNameMap,
  ExpressionAttributeValueMap,
} from "aws-sdk/clients/dynamodb";
import { DocumentClient } from "aws-sdk/lib/dynamodb/document_client";

export type UpdateKind =
  | "add"
  | "append"
  | "assign"
  | "decrement"
  | "delete"
  | "increment"
  | "prepend"
  | "remove"
  | "set";

interface IUpdate {
  kind: UpdateKind;
}

export interface UpdateAdd extends IUpdate {
  kind: "add";
  path: string;
  value: DocumentClient.DynamoDbSet | number;
}

export interface UpdateAppend extends IUpdate {
  kind: "append";
  path: string;
  value: DocumentClient.AttributeValue | DocumentClient.AttributeValue[];
}

export interface UpdateAssign extends IUpdate {
  kind: "assign";
  item: AttributeMap;
}

export interface UpdateDecrement extends IUpdate {
  kind: "decrement";
  path: string;
  value: number;
}

export interface UpdateDelete extends IUpdate {
  kind: "delete";
  path: string;
  value: DocumentClient.DynamoDbSet;
}

export interface UpdateIncrement extends IUpdate {
  kind: "increment";
  path: string;
  value: number;
}

export interface UpdatePrepend extends IUpdate {
  kind: "prepend";
  path: string;
  value: DocumentClient.AttributeValue | DocumentClient.AttributeValue[];
}

export interface UpdateRemove extends IUpdate {
  kind: "remove";
  path: string;
}

export interface UpdateSet extends IUpdate {
  kind: "set";
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
