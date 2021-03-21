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
  createIfAttributePathDoesNotExist: boolean;
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
  createIfAttributePathDoesNotExist: boolean;
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

  /**
   * Assign value to an Item
   * @param value NativeValue
   * @param ifDoesNotExist boolean
   * @returns Update
   */
  assign(value: NativeValue, ifDoesNotExist = false) {
    for (const [attributePath, attributeValue] of Object.entries(value)) {
      if (attributeValue !== undefined) {
        this.#UpdateExpressions.push({
          kind: "set",
          attributePath,
          value: attributeValue,
          ifDoesNotExist,
        } as UpdateSet);
      }
    }
    return this;
  }

  /**
   * Increment a numeric value
   * @param attributePath string
   * @param value number
   * @param createIfAttributePathDoesNotExist boolean
   * @returns Update
   */
  increment(
    attributePath: string,
    value = 1,
    createIfAttributePathDoesNotExist = true,
  ) {
    this.#UpdateExpressions.push({
      kind: createIfAttributePathDoesNotExist ? "add" : "increment",
      attributePath,
      value,
    });
    return this;
  }

  /**
   * Decrement a numeric value
   * @param attributePath string
   * @param value number
   * @param createIfAttributePathDoesNotExist boolean
   * @returns Update
   */
  decrement(
    attributePath: string,
    value = 1,
    createIfAttributePathDoesNotExist = true,
  ) {
    return this.increment(
      attributePath,
      -1 * value,
      createIfAttributePathDoesNotExist,
    );
  }

  /**
   * Append values to an Array
   * @param attributePath string
   * @param values NativeAttributeValue[]
   * @param createIfAttributePathDoesNotExist boolean
   * @returns Update
   */
  append(
    attributePath: string,
    values: NativeAttributeValue[],
    createIfAttributePathDoesNotExist = true,
  ) {
    this.#UpdateExpressions.push({
      kind: "append",
      attributePath,
      value: values,
      createIfAttributePathDoesNotExist,
    });
    return this;
  }

  /**
   * Prepend values to an Array
   * @param attributePath string
   * @param values NativeAttributeValue[]
   * @param createIfAttributePathDoesNotExist boolean
   * @returns Update
   */
  prepend(
    attributePath: string,
    values: NativeAttributeValue[],
    createIfAttributePathDoesNotExist = true,
  ) {
    this.#UpdateExpressions.push({
      kind: "prepend",
      attributePath,
      value: values,
      createIfAttributePathDoesNotExist,
    });
    return this;
  }

  /**
   * Add items to a Set
   * @param attributePath string
   * @param values Set
   * @returns Update
   */
  add(attributePath: string, values: Set<string | number>) {
    this.#UpdateExpressions.push({
      kind: "add",
      attributePath,
      value: values,
    });
    return this;
  }

  /**
   * Remove items from a Set
   * @param attributePath string
   * @param values Set
   * @returns Update
   */
  delete(attributePath: string, values: Set<string | number>) {
    this.#UpdateExpressions.push({
      kind: "delete",
      attributePath,
      value: values,
    });
    return this;
  }

  /**
   * Remove a property from an item
   * @param attributePath string
   * @returns Update
   */
  drop(attributePath: string) {
    this.#UpdateExpressions.push({
      kind: "remove",
      attributePath: attributePath,
    } as UpdateRemove);
    return this;
  }

  [BUILD]() {
    const keyAttributes = Object.keys(this.key || {});
    return {
      ...super[BUILD](),
      ...(this.#UpdateExpressions.length > 0 && {
        _UpdateExpressions: this.#UpdateExpressions.filter(
          (expression) => !keyAttributes.includes(expression.attributePath),
        ),
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
        error.$input = requestInput;
        bail(error);
      } finally {
        shortCircuit.halt();
      }
    }, RETRY_OPTIONS);
  };
}
