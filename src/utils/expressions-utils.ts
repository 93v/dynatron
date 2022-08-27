import { NativeAttributeValue } from "@aws-sdk/util-dynamodb";

import { Condition } from "../../types/conditions";
import { and } from "../condition-expression-builders";
import { NativeValue } from "../dynatron";
import { UpdateType } from "../requesters/items/items-update";
import { assertNever } from "./misc-utils";
import { nextAlpha } from "./next-alpha-char-generator";

type NativeUpdateType = "SET" | "ADD" | "REMOVE" | "DELETE";

type NativeExpressionModel = {
  expressionString: string;
  expressionAttributeNames: Record<string, string>;
  expressionAttributeValues?: NativeValue;
};

export const parseAttributePath = (attributePath: string) => {
  const enum Mode {
    AFTER_LIST_INDEX,
    ESCAPED,
    LIST_INDEX,
    NORMAL,
  }
  const enum SpecialChar {
    DOT = ".",
    ESCAPE = "\\",
    LEFT_BRACKET = "[",
    RIGHT_BRACKET = "]",
  }
  const path = attributePath.trim();

  if (path.length === 0) {
    throw new Error("Empty path");
  }
  if (path.slice(-1) === SpecialChar.DOT) {
    throw new Error(
      `Invalid control character encountered in path "${path}" at index [${
        path.length - 1
      }]`,
    );
  }
  let mode: Mode = Mode.NORMAL;
  let buffer = "";
  const elements: (
    | { type: "name"; name: string }
    | { type: "index"; index: number }
  )[] = [];

  const chars = [...path];
  for (const [index, char] of chars.entries()) {
    if (mode === Mode.ESCAPED) {
      buffer += char;
      mode = Mode.NORMAL;
      continue;
    }

    if (mode === Mode.LIST_INDEX) {
      if (char === SpecialChar.RIGHT_BRACKET) {
        const listIndexValue = Number.parseInt(buffer);
        if (!Number.isFinite(listIndexValue)) {
          throw new TypeError(
            `Empty array index encountered in path "${path}" at index [${
              index - buffer.length
            }]`,
          );
        }
        elements.push({
          type: "index",
          index: listIndexValue,
        });
        buffer = "";
        mode = Mode.AFTER_LIST_INDEX;
        continue;
      }

      if (!/^\d$/.test(char)) {
        throw new Error(
          `Invalid array index character "${char}" encountered in path "${path}" at index [${index}]`,
        );
      }
      buffer += char;
      continue;
    }

    if (mode === Mode.AFTER_LIST_INDEX) {
      if (char !== SpecialChar.LEFT_BRACKET && char !== SpecialChar.DOT) {
        throw new Error(
          `Bare identifier encountered between list index accesses in path "${path}" at index [${index}]`,
        );
      }
      mode = char === SpecialChar.LEFT_BRACKET ? Mode.LIST_INDEX : Mode.NORMAL;
      continue;
    }

    // Normal mode
    if (char === SpecialChar.DOT || char === SpecialChar.LEFT_BRACKET) {
      if (buffer === "") {
        throw new Error(
          `Invalid control character encountered in path "${path}" at index [${index}]`,
        );
      }
      elements.push({ type: "name", name: buffer });
      buffer = "";
      if (char === SpecialChar.LEFT_BRACKET) {
        mode = Mode.LIST_INDEX;
      }
      continue;
    }

    if (char === SpecialChar.ESCAPE) {
      const nextChar = chars[index + 1];
      if (
        nextChar === SpecialChar.DOT ||
        nextChar === SpecialChar.LEFT_BRACKET ||
        nextChar === SpecialChar.ESCAPE
      ) {
        mode = Mode.ESCAPED;
        continue;
      }
    }

    buffer += char;
  }
  if (buffer.length > 0) {
    elements.push({ type: "name", name: buffer });
  }
  return elements;
};

const serializeExpressionValue = (
  value: NativeAttributeValue,
  prefix: string,
) => ({ name: `:${prefix}${nextAlpha.getNext()}`, value });

const serializeUpdateExpression = (
  update: UpdateType,
  prefix: string,
): { Type: NativeUpdateType } & NativeExpressionModel => {
  const { expressionString, expressionAttributeNames } = serializeAttributePath(
    update.attributePath,
    prefix,
  );
  const attributeValue = serializeExpressionValue(update["value"], prefix);

  switch (update.kind) {
    case "add":
    case "delete":
      return {
        Type: update.kind === "add" ? "ADD" : "DELETE",
        expressionString: `${expressionString} ${attributeValue.name}`,
        expressionAttributeNames: expressionAttributeNames,
        expressionAttributeValues: {
          [attributeValue.name]: attributeValue.value,
        },
      };
    case "append":
    case "prepend": {
      const fullExpressionString = update.createIfAttributePathDoesNotExist
        ? `if_not_exists(${expressionString}, :empty_list)`
        : expressionString;
      return {
        Type: "SET",
        expressionString: `${expressionString}=list_append(${
          update.kind === "append" ? fullExpressionString : attributeValue.name
        },${
          update.kind === "append" ? attributeValue.name : fullExpressionString
        })`,
        expressionAttributeNames: expressionAttributeNames,
        expressionAttributeValues: {
          [attributeValue.name]: attributeValue.value,
          ...(update.createIfAttributePathDoesNotExist && {
            ":empty_list": [],
          }),
        },
      };
    }
    case "increment":
      return {
        Type: "SET",
        expressionString: `${expressionString}=${expressionString}+${attributeValue.name}`,
        expressionAttributeNames: expressionAttributeNames,
        expressionAttributeValues: {
          [attributeValue.name]: attributeValue.value,
        },
      };
    case "remove":
      return {
        Type: "REMOVE",
        expressionString: `${expressionString}`,
        expressionAttributeNames: expressionAttributeNames,
      };
    case "set":
      return {
        Type: "SET",
        expressionString: `${expressionString}=${
          update.ifDoesNotExist ? "if_not_exists(" + expressionString + "," : ""
        }${attributeValue.name}${update.ifDoesNotExist ? ")" : ""}`,
        expressionAttributeNames: expressionAttributeNames,
        expressionAttributeValues: {
          [attributeValue.name]: attributeValue.value,
        },
      };
    default:
      throw assertNever(update);
  }
};

const serializeConditionExpression = (
  condition: Condition,
  prefix: string,
  level = 0,
): NativeExpressionModel => {
  switch (condition.kind) {
    case "attribute_exists":
    case "attribute_not_exists": {
      const aPath = serializeAttributePath(condition.attributePath, prefix);
      return {
        expressionString: `${condition.kind}(${aPath.expressionString})`,
        expressionAttributeNames: aPath.expressionAttributeNames,
      };
    }
    case "attribute_type":
    case "begins_with":
    case "contains": {
      const aPath = serializeAttributePath(condition.attributePath, prefix);
      const aValue = serializeExpressionValue(condition.value, prefix);
      return {
        expressionString: `${condition.kind}(${aPath.expressionString},${aValue.name})`,
        expressionAttributeNames: aPath.expressionAttributeNames,
        expressionAttributeValues: { [aValue.name]: aValue.value },
      };
    }
    case "BETWEEN": {
      const path =
        typeof condition.attributePath === "string"
          ? condition.attributePath
          : condition.attributePath.attributePath;
      const attributePath = serializeAttributePath(path, prefix);
      const attributeValues = condition.values.map((value) =>
        serializeExpressionValue(value, prefix),
      );

      return {
        expressionString: `${
          typeof condition.attributePath !== "string" ? "size(" : ""
        }${attributePath.expressionString}${
          typeof condition.attributePath !== "string" ? ")" : ""
        } ${condition.kind} ${attributeValues
          .map((v) => v.name)
          .filter((t) => t.trim() !== "")
          .join(` AND `)}`,
        expressionAttributeNames: attributePath.expressionAttributeNames,
        expressionAttributeValues: Object.fromEntries(
          attributeValues.map((attributeValue) => [
            attributeValue.name,
            attributeValue.value,
          ]),
        ),
      };
    }
    case "=":
    case ">":
    case ">=":
    case "<":
    case "<=":
    case "<>": {
      const path =
        typeof condition.attributePath === "string"
          ? condition.attributePath
          : condition.attributePath.attributePath;
      const attributePath = serializeAttributePath(path, prefix);
      const attributeValue = serializeExpressionValue(condition.value, prefix);
      return {
        expressionString: `${
          typeof condition.attributePath !== "string" ? "size(" : ""
        }${attributePath.expressionString}${
          typeof condition.attributePath !== "string" ? ")" : ""
        }${condition.kind}${attributeValue.name}`,
        expressionAttributeNames: attributePath.expressionAttributeNames,
        expressionAttributeValues: {
          [attributeValue.name]: attributeValue.value,
        },
      };
    }
    case "IN": {
      const path =
        typeof condition.attributePath === "string"
          ? condition.attributePath
          : condition.attributePath.attributePath;
      const attributePath = serializeAttributePath(path, prefix);
      const attributeValues = condition.values.map((value) =>
        serializeExpressionValue(value, prefix),
      );
      return {
        expressionString: `${
          typeof condition.attributePath !== "string" ? "size(" : ""
        }${attributePath.expressionString}${
          typeof condition.attributePath !== "string" ? ")" : ""
        } ${condition.kind}(${attributeValues
          .map((v) => v.name)
          // .filter((t) => t.trim() !== "")
          .join(",")})`,
        expressionAttributeNames: attributePath.expressionAttributeNames,
        expressionAttributeValues: Object.fromEntries(
          attributeValues.map((attributeValue) => [
            attributeValue.name,
            attributeValue.value,
          ]),
        ),
      };
    }
    case "NOT": {
      const serialized = serializeConditionExpression(
        condition.condition,
        prefix,
        level + 1,
      );
      return {
        expressionString: `(${condition.kind} ${serialized.expressionString})`,
        expressionAttributeNames: serialized.expressionAttributeNames,
        expressionAttributeValues: serialized.expressionAttributeValues,
      };
    }
    case "AND":
    case "OR": {
      const serializedConditions = condition.conditions.map((c) =>
        serializeConditionExpression(
          c,
          prefix,
          level + condition.conditions.length - 1,
        ),
      );
      return {
        expressionString: `${
          condition.conditions.length > 1 && level > 0 ? "(" : ""
        }${serializedConditions
          .map((c) => c.expressionString)
          .filter((t) => t.trim() !== "")
          .join(` ${condition.kind} `)}${
          condition.conditions.length > 1 && level > 0 ? ")" : ""
        }`,
        expressionAttributeNames: Object.assign(
          {},
          ...serializedConditions.map((c) => c.expressionAttributeNames),
        ),
        expressionAttributeValues: Object.assign(
          {},
          ...serializedConditions.map((c) => c.expressionAttributeValues),
        ),
      };
    }
    default:
      throw assertNever(condition);
  }
};

const serializeAttributePath = (attributePath: string, prefix: string) => {
  const parsedAttributePath = parseAttributePath(attributePath);
  let expressionString = "";
  const attributeNamesMap: Record<string, string> = {};
  for (const pathElement of parsedAttributePath) {
    if (pathElement.type === "index") {
      expressionString += `[${pathElement.index}]`;
      continue;
    }
    const pathElementName = pathElement.name;
    attributeNamesMap[pathElementName] ??= `#${
      typeof attributeNamesMap[pathElementName] === "number"
        ? attributeNamesMap[pathElementName]
        : `${prefix}${nextAlpha.getNext()}`
    }`;
    if (expressionString !== "") {
      expressionString += ".";
    }
    expressionString += `${attributeNamesMap[pathElementName]}`;
  }
  const expressionAttributeNames: Record<string, string> = {};
  for (const key in attributeNamesMap) {
    expressionAttributeNames[attributeNamesMap[key]] = key;
  }
  return { expressionString, expressionAttributeNames };
};

export const marshallProjectionExpression = (
  projectionExpressions: string[],
) => {
  const serializedProjections = [...new Set(projectionExpressions)].map(
    (projection) => serializeAttributePath(projection, "p_"),
  );

  const aggregatedProjections: {
    expressionStrings: string[];
    expressionAttributeNames: Record<string, string>;
  } = { expressionStrings: [], expressionAttributeNames: {} };

  for (const projection of serializedProjections) {
    aggregatedProjections.expressionStrings = [
      ...new Set([
        ...aggregatedProjections.expressionStrings,
        projection.expressionString,
      ]),
    ];
    aggregatedProjections.expressionAttributeNames = {
      ...aggregatedProjections.expressionAttributeNames,
      ...projection.expressionAttributeNames,
    };
  }

  return {
    expressionString: aggregatedProjections.expressionStrings
      .filter((t) => t.trim() !== "")
      .join(", "),
    expressionAttributeNames: aggregatedProjections.expressionAttributeNames,
  };
};

export const marshallUpdateExpression = (
  updates: UpdateType[],
  prefix = "",
) => {
  const updateMap: {
    [group in NativeUpdateType]?: NativeExpressionModel[];
  } = {};

  for (const update of updates) {
    const { Type, ...updateExpression } = serializeUpdateExpression(
      update,
      prefix,
    );
    updateMap[Type] = [...(updateMap[Type] ?? []), updateExpression];
  }

  const updateObject: NativeExpressionModel = {
    expressionString: "",
    expressionAttributeNames: {},
    expressionAttributeValues: {},
  };

  for (const updateGroup of Object.keys(updateMap)) {
    const group: NativeExpressionModel[] = updateMap[updateGroup];

    const flatGroup: NativeExpressionModel = {
      expressionString: "",
      expressionAttributeNames: {},
      expressionAttributeValues: {},
    };

    for (const update of group) {
      flatGroup.expressionString = flatGroup.expressionString
        ? `${flatGroup.expressionString}, ${update.expressionString}`
        : update.expressionString;
      flatGroup.expressionAttributeNames = {
        ...flatGroup.expressionAttributeNames,
        ...update.expressionAttributeNames,
      };
      flatGroup.expressionAttributeValues = {
        ...flatGroup.expressionAttributeValues,
        ...update.expressionAttributeValues,
      };
    }

    updateObject.expressionString =
      updateObject.expressionString +
      ` ${updateGroup.toUpperCase()} ${flatGroup.expressionString}`;

    updateObject.expressionAttributeNames = {
      ...updateObject.expressionAttributeNames,
      ...flatGroup.expressionAttributeNames,
    };

    updateObject.expressionAttributeValues = {
      ...updateObject.expressionAttributeValues,
      ...flatGroup.expressionAttributeValues,
    };
  }

  return {
    expressionString: updateObject.expressionString.trim(),
    expressionAttributeNames: updateObject.expressionAttributeNames,
    expressionAttributeValues: updateObject.expressionAttributeValues,
  };
};

export const marshallConditionExpression = (
  conditions: Condition[],
  prefix = "",
) => serializeConditionExpression(and(conditions), prefix);
