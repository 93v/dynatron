import fastEquals from "fast-deep-equal";

export const optimizeExpression = (
  expression: string,
  attributeNames: Record<string, string>,
  attributeValues?: Record<string, any>,
): {
  expression: string;
  expressionAttributeNames: Record<string, string>;
  expressionAttributeValues?: Record<string, any>;
} => {
  let optimizedExpression = expression;

  const optimizedNames: Record<string, string> = {};
  const optimizedValues: Record<string, any> = {};

  for (const key in attributeNames) {
    const attributeName = attributeNames[key];
    if (optimizedNames[attributeName] == undefined) {
      optimizedNames[attributeName] = key;
    } else {
      optimizedExpression = optimizedExpression
        .split(key)
        .join(optimizedNames[attributeName]);
    }
  }

  if (attributeValues != undefined) {
    for (const key in attributeValues) {
      const value = attributeValues[key];
      const optimizedKey = Object.keys(optimizedValues).find((k) =>
        fastEquals(optimizedValues[k], value),
      );
      if (optimizedKey) {
        optimizedExpression = optimizedExpression.split(key).join(optimizedKey);
      } else {
        optimizedValues[key] = value;
      }
    }
  }

  const aggregatedOptimizedNames: Record<string, string> = {};

  for (const key in optimizedNames) {
    aggregatedOptimizedNames[optimizedNames[key]] = key;
  }

  return {
    expression: optimizedExpression,
    expressionAttributeNames: aggregatedOptimizedNames,
    ...(attributeValues && { expressionAttributeValues: optimizedValues }),
  };
};
