import { parseAttributePath } from "./attribute-path-parser";
import alpha from "./next-alpha-char-generator";

export const serializeAttributePath = (string: string) => {
  const parsedPath = parseAttributePath(string);

  let expression = "";

  const attributeNamesMap = {};

  for (const pathElement of parsedPath) {
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
