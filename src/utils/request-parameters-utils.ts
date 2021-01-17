import { RequestParameters } from "../../types/request";
import { serializeAttributePath } from "./attribute-path-utils";
import { optimizeExpression } from "./expression-optimization-utils";

const marshallProjectionExpression = (rawProjectionExpression: string[]) => {
  const serializedProjections = [
    ...new Set(rawProjectionExpression),
  ].map((projection) => serializeAttributePath(projection));

  const aggregatedProjections: {
    expressions: string[];
    expressionAttributeNames: Record<string, string>;
  } = { expressions: [], expressionAttributeNames: {} };

  for (const projection of serializedProjections) {
    aggregatedProjections.expressions = [
      ...new Set([...aggregatedProjections.expressions, projection.expression]),
    ];
    aggregatedProjections.expressionAttributeNames = {
      ...aggregatedProjections.expressionAttributeNames,
      ...projection.expressionAttributeNames,
    };
  }
  const projectionExpression = aggregatedProjections?.expressions
    .filter((t) => t.trim() !== "")
    .join(", ");

  const projectionExpressionAttributeNames =
    aggregatedProjections?.expressionAttributeNames;

  if (
    projectionExpression == undefined ||
    projectionExpressionAttributeNames == undefined
  ) {
    return {};
  }

  const { expression, expressionAttributeNames } = optimizeExpression(
    projectionExpression,
    projectionExpressionAttributeNames,
  );

  return { expression, expressionAttributeNames };
};

export const convertRawProjectionExpression = (
  requestParameters: RequestParameters,
) => {
  const parameters = { ...requestParameters };

  if (!parameters.RawProjectionExpression) {
    return parameters;
  }

  const { expression, expressionAttributeNames } = marshallProjectionExpression(
    parameters.RawProjectionExpression,
  );

  if (expression == undefined) {
    return parameters;
  }

  delete parameters.RawProjectionExpression;

  parameters.ProjectionExpression = expression;

  parameters.ExpressionAttributeNames =
    parameters.ExpressionAttributeNames || {};

  parameters.ExpressionAttributeNames = {
    ...parameters.ExpressionAttributeNames,
    ...expressionAttributeNames,
  };

  return parameters;
};
