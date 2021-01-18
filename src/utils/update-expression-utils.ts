import { RawUpdate, RawUpdateType, UpdateType } from "../../types/update";
import { serializeAttributePath } from "./attribute-path-serializer";
import { assertNever, serializeExpressionValue } from "./misc-utils";

export const serializeUpdateExpression = (
  update: UpdateType,
  prefix = "",
): { Type: RawUpdateType } & RawUpdate => {
  const { expressionString, expressionAttributeNames } = serializeAttributePath(
    update.attributePath,
    prefix,
  );
  const attributeValue = serializeExpressionValue(
    update["value"] ?? undefined,
    prefix,
  );

  switch (update.kind) {
    case "add":
    case "delete":
      return {
        Type: update.kind === "add" ? "ADD" : "DELETE",
        Expression: `${expressionString} ${attributeValue.name}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: {
          [attributeValue.name]: attributeValue.value,
        },
      };
    case "append":
    case "prepend":
      return {
        Type: "SET",
        Expression: `${expressionString}=list_append(${
          update.kind === "append" ? expressionString : attributeValue.name
        },${
          update.kind === "append" ? attributeValue.name : expressionString
        })`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: {
          [attributeValue.name]: attributeValue.value,
        },
      };
    case "decrement":
    case "increment":
      return {
        Type: "SET",
        Expression: `${expressionString}=${expressionString}${
          update.kind === "increment" ? "+" : "-"
        }${attributeValue.name}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: {
          [attributeValue.name]: attributeValue.value,
        },
      };
    case "remove":
      return {
        Type: "REMOVE",
        Expression: `${expressionString}`,
        ExpressionAttributeNames: expressionAttributeNames,
      };
    case "set":
      return {
        Type: "SET",
        Expression: `${expressionString}=${
          update.ifNotExist ? "if_not_exists(" + expressionString + "," : ""
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
