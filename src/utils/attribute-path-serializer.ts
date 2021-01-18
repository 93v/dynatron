import { parseAttributePath } from "./attribute-path-parser";
import alpha from "./next-alpha-char-generator";

export const serializeAttributePath = (attributePath: string, prefix = "") => {
  const parsedAttributePath = parseAttributePath(attributePath);

  let expressionString = "";

  const attributeNamesMap: Record<string, string> = {};

  for (const pathElement of parsedAttributePath) {
    if (pathElement.type === "ListIndex") {
      expressionString += `[${pathElement.index}]`;
      continue;
    }

    const pathElementName = pathElement.name;
    attributeNamesMap[pathElementName] =
      attributeNamesMap[pathElementName] ||
      `#${
        typeof attributeNamesMap[pathElementName] === "number"
          ? attributeNamesMap[pathElementName]
          : `${prefix}${alpha.getNext()}`
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
