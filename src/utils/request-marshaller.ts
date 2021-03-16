import {
  AttributeValue,
  ReturnConsumedCapacity,
  ReturnItemCollectionMetrics,
  ReturnValue,
} from "@aws-sdk/client-dynamodb";
import { marshall, marshallOptions } from "@aws-sdk/util-dynamodb";

import { AndCondition, Condition } from "../../types/conditions";
import { NativeValue } from "../dynatron";
import { UpdateType } from "../requesters/items/2.1.3-update";
import {
  marshallConditionExpression,
  marshallProjectionExpression,
  marshallUpdateExpression,
} from "./expressions-utils";

type NativeRequestParameters = {
  _ConditionExpressions?: Condition[];
  _ExclusiveStartKey?: NativeValue;
  _FilterExpressions?: Condition[];
  _Item?: NativeValue;
  _Items?: NativeValue[];
  _Key?: NativeValue;
  _KeyConditionExpression?: AndCondition;
  _Keys?: NativeValue[];
  _ProjectionExpressions?: string[];
  _UpdateExpressions?: UpdateType[];
  ClientRequestToken?: string;
  ConsistentRead?: boolean;
  ExpressionAttributeNames?: Record<string, string>;
  ExpressionAttributeValues?: NativeValue;
  IndexName?: string;
  Limit?: number;
  ReturnConsumedCapacity?: ReturnConsumedCapacity;
  ReturnItemCollectionMetrics?: ReturnItemCollectionMetrics;
  ReturnValues?: ReturnValue;
  ScanIndexForward?: boolean;
  Segment?: number;
  TableName?: string;
  TotalSegments?: number;
};

export type MarshalledRequestParameters = {
  ClientRequestToken?: string;
  ConsistentRead?: boolean;
  ExclusiveStartKey?: Record<string, AttributeValue>;
  IndexName?: string;
  Item?: Record<string, AttributeValue>;
  Items?: Record<string, AttributeValue>[];
  Key?: Record<string, AttributeValue>;
  Keys?: Record<string, AttributeValue>[];
  Limit?: number;
  ReturnConsumedCapacity?: ReturnConsumedCapacity;
  ReturnItemCollectionMetrics?: ReturnItemCollectionMetrics;
  ReturnValues?: ReturnValue;
  ScanIndexForward?: boolean;
  Segment?: number;
  TableName?: string;
  TotalSegments?: number;

  ConditionExpression?: string;
  FilterExpression?: string;
  KeyConditionExpression?: string;
  ProjectionExpression?: string;
  UpdateExpression?: string;

  ExpressionAttributeNames?: Record<string, string>;
  ExpressionAttributeValues?: Record<string, AttributeValue>;
};

const MARSHALL_OPTIONS: marshallOptions = { removeUndefinedValues: true };

const cleanupEmptyExpressions = (
  requestParameters: NativeRequestParameters,
) => {
  const parameters = { ...requestParameters };
  if (Object.keys(parameters.ExpressionAttributeNames ?? {}).length === 0) {
    delete parameters.ExpressionAttributeNames;
  }
  if (Object.keys(parameters.ExpressionAttributeValues ?? {}).length === 0) {
    delete parameters.ExpressionAttributeValues;
  }
  return parameters;
};

export const marshallRequestParameters = <T>(
  requestParameters: NativeRequestParameters,
) => {
  const marshalledParameters: MarshalledRequestParameters = {};

  if (requestParameters.TableName) {
    marshalledParameters.TableName = requestParameters.TableName;
  }

  if (requestParameters._Key) {
    marshalledParameters.Key = marshall(
      requestParameters._Key,
      MARSHALL_OPTIONS,
    );
  }

  if (requestParameters._Keys) {
    marshalledParameters.Keys = requestParameters._Keys.map((key) =>
      marshall(key, MARSHALL_OPTIONS),
    );
  }

  if (requestParameters._ExclusiveStartKey) {
    marshalledParameters.ExclusiveStartKey = marshall(
      requestParameters._ExclusiveStartKey,
      MARSHALL_OPTIONS,
    );
  }

  if (requestParameters._Item) {
    marshalledParameters.Item = marshall(
      requestParameters._Item,
      MARSHALL_OPTIONS,
    );
  }

  if (requestParameters._Items) {
    marshalledParameters.Items = requestParameters._Items.map((key) =>
      marshall(key, MARSHALL_OPTIONS),
    );
  }

  if (requestParameters.ReturnConsumedCapacity) {
    marshalledParameters.ReturnConsumedCapacity =
      requestParameters.ReturnConsumedCapacity;
  }

  if (requestParameters.ConsistentRead) {
    marshalledParameters.ConsistentRead = requestParameters.ConsistentRead;
  }

  if (requestParameters._ProjectionExpressions?.length) {
    const marshalledProjectionExpression = marshallProjectionExpression(
      requestParameters._ProjectionExpressions,
    );

    marshalledParameters.ProjectionExpression =
      marshalledProjectionExpression.expressionString;

    marshalledParameters.ExpressionAttributeNames = {
      ...marshalledParameters.ExpressionAttributeNames,
      ...marshalledProjectionExpression.expressionAttributeNames,
    };
  }

  if (requestParameters.IndexName) {
    marshalledParameters.IndexName = requestParameters.IndexName;
  }

  if (requestParameters.Limit) {
    marshalledParameters.Limit = requestParameters.Limit;
  }

  if (requestParameters.TotalSegments) {
    marshalledParameters.TotalSegments = requestParameters.TotalSegments;
  }

  if (requestParameters.ReturnItemCollectionMetrics) {
    marshalledParameters.ReturnItemCollectionMetrics =
      requestParameters.ReturnItemCollectionMetrics;
  }

  if (requestParameters.ReturnValues) {
    marshalledParameters.ReturnValues = requestParameters.ReturnValues;
  }

  if (requestParameters.ScanIndexForward != undefined) {
    marshalledParameters.ScanIndexForward = requestParameters.ScanIndexForward;
  }

  if (requestParameters.Segment != undefined) {
    marshalledParameters.Segment = requestParameters.Segment;
  }

  if (requestParameters.ClientRequestToken != undefined) {
    marshalledParameters.ClientRequestToken =
      requestParameters.ClientRequestToken;
  }

  if (requestParameters._FilterExpressions?.length) {
    const marshalledFilterExpression = marshallConditionExpression(
      requestParameters._FilterExpressions,
      "f_",
    );

    marshalledParameters.FilterExpression =
      marshalledFilterExpression.expressionString;

    marshalledParameters.ExpressionAttributeNames = {
      ...marshalledParameters.ExpressionAttributeNames,
      ...marshalledFilterExpression.expressionAttributeNames,
    };

    marshalledParameters.ExpressionAttributeValues = {
      ...marshalledParameters.ExpressionAttributeValues,
      ...marshalledFilterExpression.expressionAttributeValues,
    };
  }

  if (requestParameters._KeyConditionExpression) {
    const marshalledKeyConditionExpression = marshallConditionExpression(
      [requestParameters._KeyConditionExpression],
      "k_",
    );

    marshalledParameters.KeyConditionExpression =
      marshalledKeyConditionExpression.expressionString;

    marshalledParameters.ExpressionAttributeNames = {
      ...marshalledParameters.ExpressionAttributeNames,
      ...marshalledKeyConditionExpression.expressionAttributeNames,
    };

    marshalledParameters.ExpressionAttributeValues = {
      ...marshalledParameters.ExpressionAttributeValues,
      ...marshalledKeyConditionExpression.expressionAttributeValues,
    };
  }

  if (requestParameters._ConditionExpressions) {
    const marshalledConditionExpression = marshallConditionExpression(
      requestParameters._ConditionExpressions,
      "c_",
    );

    marshalledParameters.ConditionExpression =
      marshalledConditionExpression.expressionString;

    marshalledParameters.ExpressionAttributeNames = {
      ...marshalledParameters.ExpressionAttributeNames,
      ...marshalledConditionExpression.expressionAttributeNames,
    };

    marshalledParameters.ExpressionAttributeValues = {
      ...marshalledParameters.ExpressionAttributeValues,
      ...marshalledConditionExpression.expressionAttributeValues,
    };
  }

  if (requestParameters._UpdateExpressions) {
    const marshalledUpdateExpression = marshallUpdateExpression(
      requestParameters._UpdateExpressions,
      "u_",
      requestParameters._Key,
    );

    marshalledParameters.UpdateExpression =
      marshalledUpdateExpression.expressionString;

    marshalledParameters.ExpressionAttributeNames = {
      ...marshalledParameters.ExpressionAttributeNames,
      ...marshalledUpdateExpression.expressionAttributeNames,
    };

    marshalledParameters.ExpressionAttributeValues = {
      ...marshalledParameters.ExpressionAttributeValues,
      ...marshalledUpdateExpression.expressionAttributeValues,
    };
  }

  if (marshalledParameters.ExpressionAttributeValues) {
    marshalledParameters.ExpressionAttributeValues = marshall(
      marshalledParameters.ExpressionAttributeValues,
      MARSHALL_OPTIONS,
    );
  }

  return cleanupEmptyExpressions(marshalledParameters) as T;
};
