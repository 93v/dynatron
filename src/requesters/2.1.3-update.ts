import { NativeAttributeValue } from "@aws-sdk/util-dynamodb";

import { NativeValue } from "../../types/native-types";
import {
  UpdateAdd,
  UpdateAppend,
  UpdateDecrement,
  UpdateDelete,
  UpdateIncrement,
  UpdatePrepend,
  UpdateRemove,
  UpdateSet,
  UpdateType,
} from "../../types/update";
import { serializeAttributePath } from "../utils/attribute-path-serializer";
import { BUILD } from "../utils/constants";
import { Check } from "./items/2.1-check";

export class Update extends Check {
  #UpdateExpressions: UpdateType[] = [];

  private set(attributePath: string, value: NativeValue, ifNotExist = false) {
    const expression: UpdateSet = {
      kind: "set",
      attributePath: attributePath,
      value,
      ifNotExist,
    };
    this.#UpdateExpressions.push(expression);
    return this;
  }

  private remove(attributePath: string | string[]) {
    if (!Array.isArray(attributePath)) {
      attributePath = [attributePath];
    }

    attributePath.forEach((p) => {
      const expression: UpdateRemove = {
        kind: "remove",
        attributePath: p,
      };
      this.#UpdateExpressions.push(expression);
    });
    return this;
  }

  private delete(attributePath: string, value: Set<string | number>) {
    const serializedPath = serializeAttributePath(attributePath);
    if (
      serializedPath.expression.includes(".") ||
      (serializedPath.expression.includes("[") &&
        serializedPath.expression.endsWith("]"))
    ) {
      throw new Error("DELETE can only be used on top-level attributes");
    }
    const expression: UpdateDelete = {
      kind: "delete",
      attributePath: attributePath,
      value,
    };
    this.#UpdateExpressions.push(expression);
    return this;
  }

  add(
    attributePath: string,
    value: Set<string | number> | (string | number) | (string | number)[],
  ) {
    const serializedPath = serializeAttributePath(attributePath);
    if (
      serializedPath.expression.includes(".") ||
      (serializedPath.expression.includes("[") &&
        serializedPath.expression.endsWith("]"))
    ) {
      throw new Error("ADD can only be used on top-level attributes");
    }

    const setValue: Set<string | number> =
      value && !(value instanceof Set)
        ? // value && value.constructor.name !== "Set" && typeof value !== "number"
          //   ? new DocumentClient().createSet(
          //       Array.isArray(value) ? value : [value],
          //       { validate: true },
          //     )
          new Set(Array.isArray(value) ? value : [value])
        : (value as Set<string | number>);

    const expression: UpdateAdd = {
      kind: "add",
      attributePath: attributePath,
      value: setValue,
    };
    this.#UpdateExpressions.push(expression);
    return this;
  }

  increment(attributePath: string, value: number, attributeExists = true) {
    const expression = attributeExists
      ? ({
          kind: "increment",
          attributePath: attributePath,
          value,
        } as UpdateIncrement)
      : ({
          kind: "add",
          attributePath: attributePath,
          value,
        } as UpdateAdd);
    this.#UpdateExpressions.push(expression);
    return this;
  }

  decrement(attributePath: string, value: number, attributeExists = true) {
    const expression = attributeExists
      ? ({
          kind: "decrement",
          attributePath: attributePath,
          value,
        } as UpdateDecrement)
      : ({
          kind: "add",
          attributePath: attributePath,
          value: -1 * value,
        } as UpdateAdd);
    this.#UpdateExpressions.push(expression);
    return this;
  }

  assign(item: NativeValue, ifNotExist = false) {
    Object.keys(item).forEach((key) => {
      this.set(key, item[key], ifNotExist);
    });
    return this;
  }

  append(
    attributePath: string,
    value: NativeAttributeValue | NativeAttributeValue[],
  ) {
    const expression: UpdateAppend = {
      kind: "append",
      attributePath: attributePath,
      value: Array.isArray(value) ? value : [value],
    };
    this.#UpdateExpressions.push(expression);
    return this;
  }

  prepend(
    attributePath: string,
    value: NativeAttributeValue | NativeAttributeValue[],
  ) {
    const expression: UpdatePrepend = {
      kind: "prepend",
      attributePath: attributePath,
      value: Array.isArray(value) ? value : [value],
    };
    this.#UpdateExpressions.push(expression);
    return this;
  }

  drop(
    attributePath: string,
    value?: Set<string | number> | (string | number) | (string | number)[],
  ) {
    if (value == undefined) {
      return;
    }
    const setValue: Set<string | number> | undefined =
      value && !(value instanceof Set)
        ? // value && value.constructor.name !== "Set"
          // ? new DocumentClient().createSet(
          //     Array.isArray(value) ? value : [value],
          //     { validate: true },
          //   )
          new Set(Array.isArray(value) ? value : [value])
        : (value as Set<string | number>);
    return setValue == undefined
      ? this.remove(attributePath)
      : this.delete(attributePath, setValue);
  }

  [BUILD]() {
    return {
      ...super[BUILD](),
      ...(this.#UpdateExpressions?.length && {
        _UpdateExpressions: this.#UpdateExpressions,
      }),
    };
  }
}
