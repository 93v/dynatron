import {
  UpdateItemCommand,
  UpdateItemCommandInput,
  UpdateItemOutput,
} from "@aws-sdk/client-dynamodb";
import { NativeAttributeValue, unmarshall } from "@aws-sdk/util-dynamodb";
import AsyncRetry from "async-retry";

import { NativeValue } from "../../dynatron";
import { isTopLevelAttributePath } from "../../utils/expressions-utils";
import {
  BUILD,
  createShortCircuit,
  isRetryableError,
  RETRY_OPTIONS,
  SHORT_MAX_LATENCY,
  TAKING_TOO_LONG_EXCEPTION,
} from "../../utils/misc-utils";
import { marshallRequestParameters } from "../../utils/request-marshaller";
import { Check } from "./2.1-check";

export type UpdateAdd = {
  kind: "add";
  attributePath: string;
  value: Set<string | number> | number;
};

export type UpdateAppend = {
  kind: "append";
  attributePath: string;
  value: NativeAttributeValue | NativeAttributeValue[];
};

export type UpdateDecrement = {
  kind: "decrement";
  attributePath: string;
  value: number;
};

export type UpdateDelete = {
  kind: "delete";
  attributePath: string;
  value: Set<string | number>;
};

export type UpdateIncrement = {
  kind: "increment";
  attributePath: string;
  value: number;
};

export type UpdatePrepend = {
  kind: "prepend";
  attributePath: string;
  value: NativeAttributeValue | NativeAttributeValue[];
};

export type UpdateRemove = {
  kind: "remove";
  attributePath: string;
};

export type UpdateSet = {
  kind: "set";
  attributePath: string;
  value: NativeAttributeValue;
  ifNotExist: boolean;
};

export type UpdateType =
  | UpdateAdd
  | UpdateAppend
  | UpdateDecrement
  | UpdateDelete
  | UpdateIncrement
  | UpdatePrepend
  | UpdateRemove
  | UpdateSet;

export class Update extends Check {
  #UpdateExpressions: UpdateType[] = [];

  assign(item: NativeValue, ifNotExist = false) {
    Object.entries(item).forEach(([attributePath, value]) => {
      this.#UpdateExpressions.push({
        kind: "set",
        attributePath,
        value,
        ifNotExist,
      } as UpdateSet);
    });
    return this;
  }

  increment(
    attributePath: string,
    value: number,
    createIfAttributePathDoesNotExist = true,
  ) {
    this.#UpdateExpressions.push(
      createIfAttributePathDoesNotExist
        ? ({
            kind: "add",
            attributePath,
            value,
          } as UpdateAdd)
        : ({
            kind: "increment",
            attributePath,
            value,
          } as UpdateIncrement),
    );
    return this;
  }

  decrement(
    attributePath: string,
    value: number,
    createIfAttributePathDoesNotExist = true,
  ) {
    this.#UpdateExpressions.push(
      createIfAttributePathDoesNotExist
        ? ({
            kind: "add",
            attributePath,
            value: -1 * value,
          } as UpdateAdd)
        : ({
            kind: "decrement",
            attributePath,
            value,
          } as UpdateDecrement),
    );
    return this;
  }

  append(
    attributePath: string,
    value: NativeAttributeValue | NativeAttributeValue[],
  ) {
    this.#UpdateExpressions.push({
      kind: "append",
      attributePath,
      value: Array.isArray(value) ? value : [value],
    } as UpdateAppend);
    return this;
  }

  prepend(
    attributePath: string,
    value: NativeAttributeValue | NativeAttributeValue[],
  ) {
    this.#UpdateExpressions.push({
      kind: "prepend",
      attributePath,
      value: Array.isArray(value) ? value : [value],
    } as UpdatePrepend);
    return this;
  }

  add(
    attributePath: string,
    value: Set<string | number> | string | number | (string | number)[],
  ) {
    if (!isTopLevelAttributePath(attributePath)) {
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
      this.#UpdateExpressions.push({
        kind: "remove",
        attributePath: attributePath,
      } as UpdateRemove);
      return this;
    }

    if (!isTopLevelAttributePath(attributePath)) {
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
        duration: attempt * SHORT_MAX_LATENCY * this.patienceRatio,
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
