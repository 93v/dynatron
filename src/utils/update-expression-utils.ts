import { RawUpdate, RawUpdateType, Update } from "../../types/update";
import { serializeAttributePath } from "./attribute-path-utils";
import { assertNever, serializeExpressionValue } from "./misc-utils";

export const serializeUpdateExpression = (
  update: Update,
): { Type: RawUpdateType } & RawUpdate => {
  const { expression: path, expressionAttributeNames } = serializeAttributePath(
    update.path,
  );
  const attributeValue = serializeExpressionValue(update["value"] ?? null);

  switch (update.kind) {
    case "add":
    case "delete":
      return {
        Type: update.kind === "add" ? "ADD" : "DELETE",
        Expression: `${path} ${attributeValue.name}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: {
          [attributeValue.name]: attributeValue.value,
        },
      };
    case "append":
    case "prepend":
      return {
        Type: "SET",
        Expression: `${path}=list_append(${
          update.kind === "append" ? path : attributeValue.name
        },${update.kind === "append" ? attributeValue.name : path})`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: {
          [attributeValue.name]: attributeValue.value,
        },
      };
    case "decrement":
    case "increment":
      return {
        Type: "SET",
        Expression: `${path}=${path}${update.kind === "increment" ? "+" : "-"}${
          attributeValue.name
        }`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: {
          [attributeValue.name]: attributeValue.value,
        },
      };
    case "remove":
      return {
        Type: "REMOVE",
        Expression: `${path}`,
        ExpressionAttributeNames: expressionAttributeNames,
      };
    case "set":
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
