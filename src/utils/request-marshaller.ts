import { marshall } from "@aws-sdk/util-dynamodb";
import { RequestParameters } from "../../types/request";
import { marshallConditionExpression } from "./condition-expression-marshaller";
import { serializeConditionExpression } from "./condition-expression-utils";
import { marshallProjectionExpression } from "./projection-expression-marshaller";

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
    marshalledParameters.Key = marshall(requestParameters._Key);
  }

  if (requestParameters._ExclusiveStartKey) {
    marshalledParameters.ExclusiveStartKey = marshall(
      requestParameters._ExclusiveStartKey,
    );
  }

  if (requestParameters._Item) {
    marshalledParameters.Item = marshall(requestParameters._Item, {
      convertEmptyValues: true,
      removeUndefinedValues: true,
    });
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
    const marshalledKeyConditionExpression = serializeConditionExpression(
      requestParameters._KeyConditionExpression,
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

  // TODO: optimize before marshalling
  marshalledParameters.ExpressionAttributeValues = marshall(
    marshalledParameters.ExpressionAttributeValues,
  );

  return cleanupEmptyExpressions(marshalledParameters) as T;

  // convertRawUpdateExpression(
  //   convertRawConditionExpressions(
  //       Object.keys(requestParams).reduce(
  //         (p: RequestParams, c) => ({
  //           ...p,
  //           ...(requestParams[c] != null ? { [c]: requestParams[c] } : {}),
  //         }),
  //         {},
  //       ),
  //     queryKey,
  //   ),
  // ),
};
