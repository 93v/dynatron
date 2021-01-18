import {
  UpdateItemCommand,
  UpdateItemCommandInput,
  UpdateItemOutput,
} from "@aws-sdk/client-dynamodb";
import { NativeAttributeValue, unmarshall } from "@aws-sdk/util-dynamodb";
import AsyncRetry from "async-retry";

import { NativeValue } from "../../../types/native-types";
import {
  UpdateAdd,
  UpdateAppend,
  UpdateDecrement,
  UpdateIncrement,
  UpdatePrepend,
  UpdateRemove,
  UpdateSet,
  UpdateType,
} from "../../../types/update";
import { serializeAttributePath } from "../../utils/attribute-path-serializer";
import {
  BUILD,
  RETRY_OPTIONS,
  SHORT_MAX_LATENCY,
  TAKING_TOO_LONG_EXCEPTION,
} from "../../utils/constants";
import { isRetryableError } from "../../utils/misc-utils";
import { marshallRequestParameters } from "../../utils/request-marshaller";
import { createShortCircuit } from "../../utils/short-circuit";
import { Check } from "./2.1-check";

export class Update extends Check {
  #UpdateExpressions: UpdateType[] = [];

  assign(item: NativeValue, ifNotExist = false) {
    Object.entries(item).forEach(([attributePath, value]) => {
      const expression: UpdateSet = {
        kind: "set",
        attributePath,
        value,
        ifNotExist,
      };
      this.#UpdateExpressions.push(expression);
    });
    return this;
  }

  increment(
    attributePath: string,
    value: number,
    createIfAttributePathDoesNotExist = true,
  ) {
    const expression = createIfAttributePathDoesNotExist
      ? ({
          kind: "add",
          attributePath,
          value,
        } as UpdateAdd)
      : ({
          kind: "increment",
          attributePath,
          value,
        } as UpdateIncrement);
    this.#UpdateExpressions.push(expression);
    return this;
  }

  decrement(
    attributePath: string,
    value: number,
    createIfAttributePathDoesNotExist = true,
  ) {
    const expression = createIfAttributePathDoesNotExist
      ? ({
          kind: "add",
          attributePath,
          value: -1 * value,
        } as UpdateAdd)
      : ({
          kind: "decrement",
          attributePath,
          value,
        } as UpdateDecrement);
    this.#UpdateExpressions.push(expression);
    return this;
  }

  append(
    attributePath: string,
    value: NativeAttributeValue | NativeAttributeValue[],
  ) {
    const expression: UpdateAppend = {
      kind: "append",
      attributePath,
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
      attributePath,
      value: Array.isArray(value) ? value : [value],
    };
    this.#UpdateExpressions.push(expression);
    return this;
  }

  add(
    attributePath: string,
    value: Set<string | number> | string | number | (string | number)[],
  ) {
    const serializedPath = serializeAttributePath(attributePath);
    if (
      serializedPath.expressionString.includes(".") ||
      (serializedPath.expressionString.includes("[") &&
        serializedPath.expressionString.endsWith("]"))
    ) {
      throw new Error("ADD can only be used on top-level attributes");
    }

    this.#UpdateExpressions.push({
      kind: "add",
      attributePath,
      value:
        value instanceof Set
          ? value
          : new Set(Array.isArray(value) ? value : [value]),
    });
    return this;
  }

  drop(
    attributePath: string,
    value?: Set<string | number> | (string | number) | (string | number)[],
  ) {
    if (value == undefined) {
      const removeExpression: UpdateRemove = {
        kind: "remove",
        attributePath: attributePath,
      };
      this.#UpdateExpressions.push(removeExpression);
      return this;
    }

    const serializedPath = serializeAttributePath(attributePath);
    if (
      serializedPath.expressionString.includes(".") ||
      (serializedPath.expressionString.includes("[") &&
        serializedPath.expressionString.endsWith("]"))
    ) {
      throw new Error("DELETE can only be used on top-level attributes");
    }

    this.#UpdateExpressions.push({
      kind: "delete",
      attributePath,
      value:
        value instanceof Set
          ? value
          : new Set(Array.isArray(value) ? value : [value]),
    });
    return this;
  }

  [BUILD]() {
    return {
      ...super[BUILD](),
      ...(this.#UpdateExpressions?.length && {
        _UpdateExpressions: this.#UpdateExpressions,
      }),
    };
  }

  $ = async <T = NativeValue | undefined, U extends boolean = false>(
    returnRawResponse?: U,
  ): Promise<U extends true ? UpdateItemOutput : T | undefined> => {
    const requestInput = marshallRequestParameters<UpdateItemCommandInput>(
      this[BUILD](),
    );
    return AsyncRetry(async (bail, attempt) => {
      const shortCircuit = createShortCircuit({
        duration: attempt * SHORT_MAX_LATENCY * (this.patienceRatio || 1),
        error: new Error(TAKING_TOO_LONG_EXCEPTION),
      });
      try {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { $metadata, ...output } = await Promise.race([
          this.databaseClient.send(new UpdateItemCommand(requestInput)),
          shortCircuit.launch(),
        ]);

        return (returnRawResponse
          ? output
          : output.Attributes && unmarshall(output.Attributes)) as any;
      } catch (error) {
        if (!isRetryableError(error)) {
          bail(error);
          return;
        }
        throw error;
      } finally {
        shortCircuit.halt();
      }
    }, RETRY_OPTIONS);
  };
}
