import {
  ExpressionAttributeNameMap,
  ExpressionAttributeValueMap,
} from "aws-sdk/clients/dynamodb";
import fastEquals from "fast-deep-equal";

import { RequestParams } from "../../types/request";

export const optimizeExpression = (
  expression: string,
  attributeNames: ExpressionAttributeNameMap,
  attributeValues?: ExpressionAttributeValueMap,
): {
  Expression: string;
  ExpressionAttributeNames: ExpressionAttributeNameMap;
  ExpressionAttributeValues?: ExpressionAttributeValueMap;
} => {
  let newExpression = expression;
  const optimizedNames: Record<string, string> = {};
  const optimizedValues: Record<string, any> = {};

  Object.keys(attributeNames).forEach((key) => {
    if (optimizedNames[attributeNames[key]] == null) {
      optimizedNames[attributeNames[key]] = key;
    } else {
      newExpression = newExpression
        .split(key)
        .join(optimizedNames[attributeNames[key]]);
    }
  });

  if (attributeValues != null) {
    Object.keys(attributeValues).forEach((key) => {
      const value = attributeValues[key];

      const optimizedKey = Object.keys(optimizedValues).find((k) =>
        fastEquals(optimizedValues[k], value),
      );

      if (optimizedKey) {
        newExpression = newExpression.split(key).join(optimizedKey);
      } else {
        optimizedValues[key] = value;
      }
    });
  }

  return {
    Expression: newExpression,
    ExpressionAttributeNames: Object.keys(optimizedNames).reduce(
      (p, c) => ({ ...p, [optimizedNames[c]]: c }),
      {},
    ),
    ...(attributeValues != null
      ? { ExpressionAttributeValues: optimizedValues }
      : {}),
  };
};

export const optimizeRequestParams = (requestParams: RequestParams) => {
  const expressions = {
    ConditionExpression: requestParams.ConditionExpression,
    FilterExpression: requestParams.FilterExpression,
    KeyConditionExpression: requestParams.KeyConditionExpression,
    ProjectionExpression: requestParams.ProjectionExpression,
    UpdateExpression: requestParams.UpdateExpression,
  };

  const optimizedNames: Record<string, string> = {};
  const optimizedValues: Record<string, any> = {};

  if (
    requestParams.ExpressionAttributeNames &&
    Object.keys(requestParams.ExpressionAttributeNames).length > 0
  ) {
    const attributeNames = requestParams.ExpressionAttributeNames;
    Object.keys(requestParams.ExpressionAttributeNames).forEach((key) => {
      if (optimizedNames[attributeNames[key]] != null) {
        Object.keys(expressions).forEach((expressionType) => {
          expressions[expressionType] = (expressions[expressionType] || "")
            .split(key)
            .join(optimizedNames[attributeNames[key]]);
        });
      } else {
        optimizedNames[attributeNames[key]] = key;
      }
    });

    requestParams.ExpressionAttributeNames = optimizedNames;
  }

  if (
    requestParams.ExpressionAttributeValues &&
    Object.keys(requestParams.ExpressionAttributeValues).length > 0
  ) {
    const attributeValues = requestParams.ExpressionAttributeValues;
    Object.keys(attributeValues).forEach((key) => {
      const value = attributeValues[key];

      const optimizedKey = Object.keys(optimizedValues).find((k) =>
        fastEquals(optimizedValues[k], value),
      );

      if (optimizedKey) {
        Object.keys(expressions).forEach((expressionType) => {
          expressions[expressionType] = (expressions[expressionType] || "")
            .split(key)
            .join(optimizedKey);
        });
      } else {
        optimizedValues[key] = value;
      }
    });
  }

  if (Object.keys(optimizedNames).length > 0) {
    requestParams.ExpressionAttributeNames = Object.keys(optimizedNames).reduce(
      (p, c) => ({ ...p, [optimizedNames[c]]: c }),
      {},
    );
  }

  if (Object.keys(optimizedValues).length > 0) {
    requestParams.ExpressionAttributeValues = optimizedValues;
  }

  Object.keys(expressions).forEach((expressionType) => {
    if (expressions[expressionType]) {
      requestParams[expressionType] = expressions[expressionType];
    }
  });

  // Shorter keys
  if (
    requestParams.ExpressionAttributeNames &&
    Object.keys(requestParams.ExpressionAttributeNames).length > 0
  ) {
    const attributeNames = requestParams.ExpressionAttributeNames;
    const optimizedAttributeNames = {};
    Object.keys(attributeNames).forEach((key, index) => {
      const newKey = `#n${index}`;
      Object.keys(expressions).forEach((expressionType) => {
        expressions[expressionType] = (expressions[expressionType] || "")
          .split(key)
          .join(newKey);
      });

      optimizedAttributeNames[newKey] = attributeNames[key];
    });
    requestParams.ExpressionAttributeNames = optimizedAttributeNames;
  }

  if (
    requestParams.ExpressionAttributeValues &&
    Object.keys(requestParams.ExpressionAttributeValues).length > 0
  ) {
    const attributeValues = requestParams.ExpressionAttributeValues;
    const optimizedAttributeValues = {};
    Object.keys(attributeValues).forEach((key, index) => {
      const newKey = `:v${index}`;
      Object.keys(expressions).forEach((expressionType) => {
        expressions[expressionType] = (expressions[expressionType] || "")
          .split(key)
          .join(newKey);
      });

      optimizedAttributeValues[newKey] = attributeValues[key];
    });
    requestParams.ExpressionAttributeValues = optimizedAttributeValues;
  }

  Object.keys(expressions).forEach((expressionType) => {
    if (!expressions[expressionType]) {
      return;
    }
    requestParams[expressionType] = expressions[expressionType];
  });

  return requestParams;
};
