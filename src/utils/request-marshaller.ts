import { marshall } from "@aws-sdk/util-dynamodb";

import { RequestParameters } from "../../types/request";
import { marshallConditionExpression } from "./condition-expression-marshaller";
import { MARSHALL_OPTIONS } from "./constants";
import { marshallProjectionExpression } from "./projection-expression-marshaller";
import { marshallUpdateExpression } from "./update-expression-marshaller";

const cleanupEmptyExpressions = (requestParameters: RequestParameters) => {
  const parameters = { ...requestParameters };
  if (Object.keys(parameters.ExpressionAttributeNames || {}).length === 0) {
    delete parameters.ExpressionAttributeNames;
  }
  if (Object.keys(parameters.ExpressionAttributeValues || {}).length === 0) {
    delete parameters.ExpressionAttributeValues;
  }
  return parameters;
};

export const marshallRequestParameters = <T>(
  requestParameters: RequestParameters,
) => {
  // This will marshall and optimize the request
  // TODO: stricter type maybe?
  const marshalledParameters: Record<string, any> = {};

  if (requestParameters.TableName) {
    marshalledParameters.TableName = requestParameters.TableName;
  }

  if (requestParameters._Key) {
    marshalledParameters.Key = marshall(
      requestParameters._Key,
      MARSHALL_OPTIONS,
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

  if (requestParameters._FilterExpressions?.length) {
    const marshalledFilterExpression = marshallConditionExpression(
      requestParameters._FilterExpressions,
      "filter_",
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
      "key_",
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
      "condition_",
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
      "update_",
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

  // TODO: optimize before marshalling
  if (marshalledParameters.ExpressionAttributeValues) {
    marshalledParameters.ExpressionAttributeValues = marshall(
      marshalledParameters.ExpressionAttributeValues,
      MARSHALL_OPTIONS,
    );
  }

  return cleanupEmptyExpressions(marshalledParameters) as T;
};
