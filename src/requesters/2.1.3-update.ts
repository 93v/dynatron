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
import { Check } from "./2.1-check";

export class Update extends Check {
  #UpdateExpressions: UpdateType[] = [];

  private set(path: string, value: NativeValue, ifNotExist = false) {
    const expression: UpdateSet = {
      kind: "set",
      path,
      value,
      ifNotExist,
    };
    this.#UpdateExpressions.push(expression);
    return this;
  }

  private remove(path: string | string[]) {
    if (!Array.isArray(path)) {
      path = [path];
    }

    path.forEach((p) => {
      const expression: UpdateRemove = {
        kind: "remove",
        path: p,
      };
      this.#UpdateExpressions.push(expression);
    });
    return this;
  }

  private delete(path: string, value: Set<string | number>) {
    const serializedPath = serializeAttributePath(path);
    if (
      serializedPath.expression.includes(".") ||
      (serializedPath.expression.includes("[") &&
        serializedPath.expression.endsWith("]"))
    ) {
      throw new Error("DELETE can only be used on top-level attributes");
    }
    const expression: UpdateDelete = {
      kind: "delete",
      path,
      value,
    };
    this.#UpdateExpressions.push(expression);
    return this;
  }

  add(
    path: string,
    value: Set<string | number> | (string | number) | (string | number)[],
  ) {
    const serializedPath = serializeAttributePath(path);
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
      path,
      value: setValue,
    };
    this.#UpdateExpressions.push(expression);
    return this;
  }

  increment(path: string, value: number, attributeExists = true) {
    const expression = attributeExists
      ? ({
          kind: "increment",
          path,
          value,
        } as UpdateIncrement)
      : ({
          kind: "add",
          path,
          value,
        } as UpdateAdd);
    this.#UpdateExpressions.push(expression);
    return this;
  }

  decrement(path: string, value: number, attributeExists = true) {
    const expression = attributeExists
      ? ({
          kind: "decrement",
          path,
          value,
        } as UpdateDecrement)
      : ({
          kind: "add",
          path,
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

  append(path: string, value: NativeAttributeValue | NativeAttributeValue[]) {
    const expression: UpdateAppend = {
      kind: "append",
      path,
      value: Array.isArray(value) ? value : [value],
    };
    this.#UpdateExpressions.push(expression);
    return this;
  }

  prepend(path: string, value: NativeAttributeValue | NativeAttributeValue[]) {
    const expression: UpdatePrepend = {
      kind: "prepend",
      path,
      value: Array.isArray(value) ? value : [value],
    };
    this.#UpdateExpressions.push(expression);
    return this;
  }

  drop(
    path: string,
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
      ? this.remove(path)
      : this.delete(path, setValue);
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
