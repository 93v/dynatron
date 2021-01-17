import { parseAttributePath } from "./attribute-path-parser";
import alpha from "./next-alpha-char-generator";

export const serializeAttributePath = (attributePath: string) => {
  const parsedAttributePath = parseAttributePath(attributePath);

  let expression = "";

  const attributeNamesMap = {};

  for (const pathElement of parsedAttributePath) {
    if (pathElement.type === "ListIndex") {
      expression += `[${pathElement.index}]`;
      continue;
    }

    const pathElementName = pathElement.name;
    attributeNamesMap[pathElementName] =
      attributeNamesMap[pathElementName] ||
      `#${
        typeof attributeNamesMap[pathElementName] === "number"
          ? attributeNamesMap[pathElementName]
          : alpha.getNext()
      }`;

    if (expression !== "") {
      expression += ".";
    }

    expression += `${attributeNamesMap[pathElementName]}`;
  }

  const expressionAttributeNames: Record<string, string> = {};

  for (const key in attributeNamesMap) {
    expressionAttributeNames[attributeNamesMap[key]] = key;
  }

  return { expression, expressionAttributeNames };
};
