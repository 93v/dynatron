import { DocumentClient } from "aws-sdk/clients/dynamodb";

import { EqualsCondition } from "../../types/conditions";
import { RequestParams } from "../../types/request";
import { RawUpdate, RawUpdateType } from "../../types/update";
import { serializeAttributePath } from "./attribute-path-utils";
import {
  and,
  serializeConditionExpression,
} from "./condition-expression-utils";
import { optimizeExpression } from "./expression-optimization-utils";
import { serializeUpdateExpression } from "./update-expression-utils";

export const convertRawProjectionExpression = (
  requestParams: RequestParams,
) => {
  const params = { ...requestParams };

  if (!params.RawProjectionExpression) {
    return params;
  }

  const projectionObject = [...new Set(params.RawProjectionExpression || [])]
    .map((projection) => serializeAttributePath(projection))
    .reduce(
      (
        p: {
          expressions: string[];
          expressionAttributeNames: Record<string, string>;
        },
        c,
      ) => {
        return {
          expressions: [...new Set([...p.expressions, c.expression])],
          expressionAttributeNames: {
            ...p.expressionAttributeNames,
            ...c.expressionAttributeNames,
          },
        };
      },
      { expressions: [], expressionAttributeNames: {} },
    );
  const projectionExpression = projectionObject?.expressions.join(", ");
  const projectionExpressionAttributeNames =
    projectionObject?.expressionAttributeNames;
  if (
    projectionExpression == null ||
    projectionExpressionAttributeNames == null
  ) {
    return params;
  }
  const { Expression, ExpressionAttributeNames } = optimizeExpression(
    projectionExpression,
    projectionExpressionAttributeNames,
  );

  params.ProjectionExpression = Expression;
  delete params.RawProjectionExpression;

  params.ExpressionAttributeNames = params.ExpressionAttributeNames || {};
  params.ExpressionAttributeNames = {
    ...params.ExpressionAttributeNames,
    ...ExpressionAttributeNames,
  };

  return params;
};

export const convertRawConditionExpressions = (
  requestParams: RequestParams,
  queryKey?: DocumentClient.Key,
) => {
  const params = { ...requestParams };

  if (queryKey != null) {
    params.RawKeyConditionExpression = params.RawKeyConditionExpression || [];

    const partitionKeyCondition: EqualsCondition = {
      kind: "=",
      path: Object.keys(queryKey)[0],
      value: queryKey[Object.keys(queryKey)[0]],
    };

    params.RawKeyConditionExpression.unshift(partitionKeyCondition);
  }

  const expressionTypes = [
    "KeyConditionExpression",
    "ConditionExpression",
    "FilterExpression",
  ];

  expressionTypes.forEach((expressionType) => {
    if (params[`Raw${expressionType}`]) {
      const {
        Expression: ConditionExpression,
        ExpressionAttributeNames,
        ExpressionAttributeValues,
      } = serializeConditionExpression(and(params[`Raw${expressionType}`]));

      const {
        Expression,
        ExpressionAttributeNames: OptimizedExpressionAttributeNames,
        ExpressionAttributeValues: OptimizedExpressionAttributeValues,
      } = optimizeExpression(
        ConditionExpression,
        ExpressionAttributeNames,
        ExpressionAttributeValues,
      );

      params[expressionType] = Expression;
      delete params[`Raw${expressionType}`];

      params.ExpressionAttributeNames = params.ExpressionAttributeNames || {};
      params.ExpressionAttributeNames = {
        ...params.ExpressionAttributeNames,
        ...OptimizedExpressionAttributeNames,
      };
      params.ExpressionAttributeValues = params.ExpressionAttributeValues || {};
      params.ExpressionAttributeValues = {
        ...params.ExpressionAttributeValues,
        ...OptimizedExpressionAttributeValues,
      };
    }
  });
  return params;
};

export const convertRawUpdateExpression = (requestParams: RequestParams) => {
  const params = { ...requestParams };

  if (!params.RawUpdateExpression) {
    return params;
  }

  const updateMap: { [group in RawUpdateType]?: RawUpdate[] } = {};

  const updateObject = {
    expression: "",
    expressionAttributeNames: {},
    expressionAttributeValues: {},
  };

  params.RawUpdateExpression.forEach((expression) => {
    const { Type, ...updateExpression } = serializeUpdateExpression(expression);
    updateMap[Type] = updateMap[Type] || [];
    (updateMap[Type] || []).push(updateExpression);
  });

  Object.keys(updateMap).forEach((updateGroup) => {
    const group: RawUpdate[] = updateMap[updateGroup];
    const flatGroup = group.reduce((p, c) => {
      return {
        Expression: p.Expression
          ? `${p.Expression}, ${c.Expression}`
          : c.Expression,
        ExpressionAttributeNames: {
          ...p.ExpressionAttributeNames,
          ...c.ExpressionAttributeNames,
        },
        ExpressionAttributeValues: {
          ...p.ExpressionAttributeValues,
          ...c.ExpressionAttributeValues,
        },
      };
    });

    if (!flatGroup.Expression) {
      return;
    }

    updateObject.expression =
      updateObject.expression +
      ` ${updateGroup.toUpperCase()} ${flatGroup.Expression}`;

    updateObject.expressionAttributeNames = {
      ...updateObject.expressionAttributeNames,
      ...flatGroup.ExpressionAttributeNames,
    };

    updateObject.expressionAttributeValues = {
      ...updateObject.expressionAttributeValues,
      ...flatGroup.ExpressionAttributeValues,
    };
  });

  const {
    Expression,
    ExpressionAttributeNames,
    ExpressionAttributeValues,
  } = optimizeExpression(
    updateObject.expression.trim(),
    updateObject.expressionAttributeNames,
    updateObject.expressionAttributeValues,
  );
  params.UpdateExpression = Expression;
  delete params.RawUpdateExpression;
  params.ExpressionAttributeNames = params.ExpressionAttributeNames || {};
  params.ExpressionAttributeNames = {
    ...params.ExpressionAttributeNames,
    ...ExpressionAttributeNames,
  };
  params.ExpressionAttributeValues = {
    ...params.ExpressionAttributeValues,
    ...ExpressionAttributeValues,
  };

  return params;
};

export const cleanupEmptyExpressions = (requestParams: RequestParams) => {
  const params = { ...requestParams };
  if (Object.keys(params.ExpressionAttributeNames || {}).length === 0) {
    delete params.ExpressionAttributeNames;
  }
  if (Object.keys(params.ExpressionAttributeValues || {}).length === 0) {
    delete params.ExpressionAttributeValues;
  }
  return params;
};
