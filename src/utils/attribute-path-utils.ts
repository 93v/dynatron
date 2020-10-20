import { v4 } from "uuid";

import { PathElement } from "../../types/request";
import { assertNever } from "./misc-utils";

const parseAttributePath = (path: string): PathElement[] => {
  const enum ParserMode {
    AFTER_LIST_INDEX_MODE,
    LIST_INDEX_MODE,
    NORMAL_MODE,
    ESCAPED_MODE,
  }

  const enum Character {
    ESCAPE_CHARACTER = "\\",
    LEFT_BRACKET = "[",
    PATH_DELIMITER = ".",
    RIGHT_BRACKET = "]",
  }

  const elements: PathElement[] = [];
  let mode: ParserMode = ParserMode.NORMAL_MODE;
  let buffer = "";

  [...path].forEach((char, index, chars) => {
    switch (mode) {
      case ParserMode.ESCAPED_MODE:
        buffer += char;
        mode = ParserMode.NORMAL_MODE;
        break;
      case ParserMode.NORMAL_MODE:
        switch (char) {
          case Character.ESCAPE_CHARACTER: {
            const nextChar = chars[index + 1];
            if (
              nextChar === Character.PATH_DELIMITER ||
              nextChar === Character.LEFT_BRACKET ||
              nextChar === Character.ESCAPE_CHARACTER
            ) {
              mode = ParserMode.ESCAPED_MODE;
              break;
            }
            buffer += char;
            break;
          }
          case Character.PATH_DELIMITER:
          case Character.LEFT_BRACKET:
            if (buffer === "") {
              throw new Error(
                `Invalid control character encountered in path [${path}] at index [${index}]`,
              );
            }
            elements.push({
              type: "AttributeName",
              name: buffer,
            });
            buffer = "";

            if (char === Character.LEFT_BRACKET) {
              mode = ParserMode.LIST_INDEX_MODE;
            }

            break;
          default:
            buffer += char;
        }
        break;
      case ParserMode.AFTER_LIST_INDEX_MODE:
        switch (char) {
          case Character.LEFT_BRACKET:
            mode = ParserMode.LIST_INDEX_MODE;
            break;
          case Character.PATH_DELIMITER:
            mode = ParserMode.NORMAL_MODE;
            break;
          default:
            throw new Error(
              `Bare identifier encountered between list index accesses in path [${path}] at index [${index}]`,
            );
        }
        break;
      case ParserMode.LIST_INDEX_MODE:
        if (char === Character.RIGHT_BRACKET) {
          const listIndexValue = parseInt(buffer);
          if (!isFinite(listIndexValue)) {
            throw new Error(
              `Invalid array index character [${buffer}] encountered in path [${path}] at index ${
                index - buffer.length
              } `,
            );
          }
          elements.push({
            type: "ListIndex",
            index: listIndexValue,
          });
          buffer = "";
          mode = ParserMode.AFTER_LIST_INDEX_MODE;
        } else {
          if (!char.match(/^\d$/)) {
            throw new Error(
              `Invalid array index character [${char}] encountered in path [${path}] at index ${index} `,
            );
          }
          buffer += char;
        }
        break;
      default:
        throw assertNever(mode);
    }
  });

  if (buffer.length > 0) {
    elements.push({
      type: "AttributeName",
      name: buffer,
    });
  }

  return elements;
};

export const serializeAttributePath = (
  string: string,
): {
  expression: string;
  expressionAttributeNames: Record<string, string>;
} => {
  const parsedPath = parseAttributePath(string);

  let serializedPath = "";
  const attributeNamesMap = {};

  parsedPath.forEach((pathElement) => {
    if (pathElement.type === "ListIndex") {
      serializedPath += `[${pathElement.index}]`;
      return;
    }
    attributeNamesMap[pathElement.name] =
      attributeNamesMap[pathElement.name] ||
      `#${
        typeof attributeNamesMap[pathElement.name] === "number"
          ? attributeNamesMap[pathElement.name]
          : v4().substring(0, 8)
      }`;

    if (serializedPath !== "") {
      serializedPath += ".";
    }

    serializedPath += `${attributeNamesMap[pathElement.name]}`;
  });
  return {
    expression: serializedPath,
    expressionAttributeNames: Object.keys(attributeNamesMap).reduce(
      (p, c) => ({ ...p, [attributeNamesMap[c]]: c }),
      {},
    ),
  };
};