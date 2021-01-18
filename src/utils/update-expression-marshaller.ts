import { RawUpdate, RawUpdateType, UpdateType } from "../../types/update";
import { serializeUpdateExpression } from "./update-expression-utils";

export const marshallUpdateExpression = (
  updates: UpdateType[],
  prefix = "",
) => {
  const updateMap: { [group in RawUpdateType]?: RawUpdate[] } = {};

  for (const update of updates) {
    const { Type, ...updateExpression } = serializeUpdateExpression(
      update,
      prefix,
    );
    updateMap[Type] = updateMap[Type] || [];
    (updateMap[Type] || []).push(updateExpression);
  }

  const updateObject = {
    expression: "",
    expressionAttributeNames: {},
    expressionAttributeValues: {},
  };

  for (const updateGroup of Object.keys(updateMap)) {
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
      continue;
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
  }

  return {
    expressionString: updateObject.expression.trim(),
    expressionAttributeNames: updateObject.expressionAttributeNames,
    expressionAttributeValues: updateObject.expressionAttributeValues,
  };
};
