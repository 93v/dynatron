import { RawUpdate, RawUpdateType, Update } from "../../types/update";
import { serializeAttributePath } from "./attribute-path-utils";
import { UpdateKind } from "./constants";
import { assertNever, serializeExpressionValue } from "./misc-utils";

export const serializeUpdateExpression = (
  update: Update,
): { Type: RawUpdateType } & RawUpdate => {
  const { expression: path, expressionAttributeNames } = serializeAttributePath(
    update.path,
  );
  const attributeValue = serializeExpressionValue(update["value"] || "");

  switch (update.kind) {
    case UpdateKind.Add:
    case UpdateKind.Delete:
      return {
        Type: update.kind === UpdateKind.Add ? "ADD" : "DELETE",
        Expression: `${path} ${attributeValue.name}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: {
          [attributeValue.name]: attributeValue.value,
        },
      };
    case UpdateKind.Append:
    case UpdateKind.Prepend:
      return {
        Type: "SET",
        Expression: `${path}=list_append(${
          update.kind === UpdateKind.Append ? path : attributeValue.name
        },${update.kind === UpdateKind.Append ? attributeValue.name : path})`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: {
          [attributeValue.name]: attributeValue.value,
        },
      };
    case UpdateKind.Decrement:
    case UpdateKind.Increment:
      return {
        Type: "SET",
        Expression: `${path}=${path}${
          update.kind === UpdateKind.Increment ? "+" : "-"
        }${attributeValue.name}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: {
          [attributeValue.name]: attributeValue.value,
        },
      };
    case UpdateKind.Remove:
      return {
        Type: "REMOVE",
        Expression: `${path}`,
        ExpressionAttributeNames: expressionAttributeNames,
      };
    case UpdateKind.Set:
      return {
        Type: "SET",
        Expression: `${path}=${
          update.ifNotExist ? "if_not_exists(" + path + "," : ""
        }${attributeValue.name}${update.ifNotExist ? ")" : ""}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: {
          [attributeValue.name]: attributeValue.value,
        },
      };
    default:
      throw assertNever(update);
  }
};
