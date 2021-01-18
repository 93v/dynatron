import { serializeAttributePath } from "./attribute-path-serializer";

export const marshallProjectionExpression = (
  projectionExpressions: string[],
) => {
  const serializedProjections = [
    ...new Set(projectionExpressions),
  ].map((projection) => serializeAttributePath(projection, "projection_"));

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

  return {
    expressionString: aggregatedProjections?.expressions
      .filter((t) => t.trim() !== "")
      .join(", "),
    expressionAttributeNames: aggregatedProjections?.expressionAttributeNames,
  };
};
