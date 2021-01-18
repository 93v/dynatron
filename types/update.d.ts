import { NativeAttributeValue } from "@aws-sdk/util-dynamodb";
import { NativeValue } from "./native-types";

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
  value: Set<string | number> | number;
}

export interface UpdateAppend extends IUpdate {
  kind: "append";
  path: string;
  value: NativeAttributeValue | NativeAttributeValue[];
}

export interface UpdateAssign extends IUpdate {
  kind: "assign";
  item: NativeValue;
}

export interface UpdateDecrement extends IUpdate {
  kind: "decrement";
  path: string;
  value: number;
}

export interface UpdateDelete extends IUpdate {
  kind: "delete";
  path: string;
  value: Set<string | number>;
}

export interface UpdateIncrement extends IUpdate {
  kind: "increment";
  path: string;
  value: number;
}

export interface UpdatePrepend extends IUpdate {
  kind: "prepend";
  path: string;
  value: NativeAttributeValue | NativeAttributeValue[];
}

export interface UpdateRemove extends IUpdate {
  kind: "remove";
  path: string;
}

export interface UpdateSet extends IUpdate {
  kind: "set";
  path: string;
  value: NativeAttributeValue;
  ifNotExist: boolean;
}

export type UpdateType =
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
  ExpressionAttributeNames: Record<string, string>;
  ExpressionAttributeValues?: NativeValue;
}
