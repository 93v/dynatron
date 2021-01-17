import { PathElement } from "../../types/request";
import { assertNever } from "./misc-utils";

export const parseAttributePath = (attributePath: string): PathElement[] => {
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

  [...attributePath].forEach((char, index, chars) => {
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
                `Invalid control character encountered in path [${attributePath}] at index [${index}]`,
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
              `Bare identifier encountered between list index accesses in path [${attributePath}] at index [${index}]`,
            );
        }
        break;
      case ParserMode.LIST_INDEX_MODE:
        if (char === Character.RIGHT_BRACKET) {
          const listIndexValue = Number.parseInt(buffer);
          if (!Number.isFinite(listIndexValue)) {
            throw new TypeError(
              `Invalid array index character [${buffer}] encountered in path [${attributePath}] at index ${
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
          if (!/^\d$/.test(char)) {
            throw new Error(
              `Invalid array index character [${char}] encountered in path [${attributePath}] at index ${index} `,
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
