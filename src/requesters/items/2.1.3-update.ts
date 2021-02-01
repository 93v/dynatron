import {
  UpdateItemCommand,
  UpdateItemCommandInput,
  UpdateItemOutput,
} from "@aws-sdk/client-dynamodb";
import { NativeAttributeValue, unmarshall } from "@aws-sdk/util-dynamodb";
import AsyncRetry from "async-retry";

import { NativeValue } from "../../dynatron";
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
  ifDoesNotExist: boolean;
};

export type UpdateType =
  | UpdateAdd
  | UpdateAppend
  | UpdateDelete
  | UpdateIncrement
  | UpdatePrepend
  | UpdateRemove
  | UpdateSet;

export class Update extends Check {
  #UpdateExpressions: UpdateType[] = [];

  assign(item: NativeValue, ifDoesNotExist = false) {
    Object.entries(item).forEach(([attributePath, value]) => {
      this.#UpdateExpressions.push({
        kind: "set",
        attributePath,
        value,
        ifDoesNotExist,
      } as UpdateSet);
    });
    return this;
  }

  increment(
    attributePath: string,
    value: number,
    createIfAttributePathDoesNotExist = true,
  ) {
    this.#UpdateExpressions.push({
      kind: createIfAttributePathDoesNotExist ? "add" : "increment",
      attributePath,
      value,
    });
    return this;
  }

  decrement(
    attributePath: string,
    value: number,
    createIfAttributePathDoesNotExist = true,
  ) {
    return this.increment(
      attributePath,
      -1 * value,
      createIfAttributePathDoesNotExist,
    );
  }

  append(attributePath: string, value: NativeAttributeValue[]) {
    this.#UpdateExpressions.push({
      kind: "append",
      attributePath,
      value,
    });
    return this;
  }

  prepend(attributePath: string, value: NativeAttributeValue[]) {
    this.#UpdateExpressions.push({
      kind: "prepend",
      attributePath,
      value,
    });
    return this;
  }

  add(attributePath: string, value: Set<string | number>) {
    this.#UpdateExpressions.push({
      kind: "add",
      attributePath,
      value,
    });
    return this;
  }

  delete(attributePath: string, value: Set<string | number>) {
    this.#UpdateExpressions.push({
      kind: "delete",
      attributePath,
      value,
    });
    return this;
  }

  drop(attributePath: string) {
    this.#UpdateExpressions.push({
      kind: "remove",
      attributePath: attributePath,
    } as UpdateRemove);
    return this;
  }

  [BUILD]() {
    return {
      ...super[BUILD](),
      ...(this.#UpdateExpressions.length > 0 && {
        _UpdateExpressions: this.#UpdateExpressions,
      }),
    };
  }

  /**
   * Execute the Update request
   * @param returnRawResponse boolean
   */
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
        if (isRetryableError(error)) {
          throw error;
        }
        bail(error);
      } finally {
        shortCircuit.halt();
      }
    }, RETRY_OPTIONS);
  };
}
