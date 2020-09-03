import retry from "async-retry";
import {
  AttributeMap,
  DocumentClient,
  PutItemInput,
  PutItemOutput,
} from "aws-sdk/clients/dynamodb";

import { Condition } from "../../types/conditions";
import { FullReturnValues, ReturnValues } from "../../types/request";
import {
  BUILD,
  BUILD_PARAMS,
  RETRY_OPTIONS,
  SHORT_MAX_LATENCY,
  TAKING_TOO_LONG_EXCEPTION,
} from "../utils/constants";
import { optimizeRequestParams } from "../utils/expression-optimization-utils";
import { isRetryableDBError, quickFail } from "../utils/misc-utils";
import { Mutator } from "./_Mutator";

export class Putter extends Mutator {
  #ConditionExpression?: Condition[];
  #ReturnValues?: ReturnValues;

  constructor(
    DB: DocumentClient,
    table: string,
    private item: DocumentClient.PutItemInputAttributeMap,
  ) {
    super(DB, table);
  }

  returnValues = (returnValues: ReturnValues = "ALL_OLD") => {
    this.#ReturnValues = returnValues;
    return this;
  };

  if = (...args: (Condition | Condition[] | undefined | null)[]) => {
    if (args.every((arg) => arg == null)) {
      return this;
    }
    this.#ConditionExpression = args.reduce((p: Condition[], c) => {
      if (c == null) {
        return p;
      }
      return [...p, ...(Array.isArray(c) ? c : [c])];
    }, this.#ConditionExpression || []);
    return this;
  };

  [BUILD]() {
    return {
      ...super[BUILD](),
      ...(this.#ConditionExpression
        ? { RawConditionExpression: this.#ConditionExpression }
        : {}),
      ...(this.#ReturnValues
        ? { ReturnValues: this.#ReturnValues as FullReturnValues }
        : {}),
    };
  }

  [BUILD_PARAMS]() {
    const requestParams = super[BUILD_PARAMS]();

    return {
      Item: this.item,
      TableName: this.table,
      ...optimizeRequestParams(requestParams),
    };
  }

  $execute = async <
    T = AttributeMap | undefined | null,
    U extends boolean = false
  >(
    returnRawResponse?: U,
  ): Promise<U extends true ? PutItemOutput : T | undefined | null> => {
    const requestParams = this[BUILD_PARAMS]() as PutItemInput;
    return retry(async (bail, attempt) => {
      try {
        const response = await Promise.race([
          this.DB.put(requestParams).promise(),
          quickFail(
            attempt * SHORT_MAX_LATENCY,
            new Error(TAKING_TOO_LONG_EXCEPTION),
          ),
        ]);
        return (returnRawResponse ? response : requestParams.Item) as any;
      } catch (ex) {
        if (!isRetryableDBError(ex)) {
          bail(ex);
          return;
        }
        throw ex;
      }
    }, RETRY_OPTIONS);
  };

  $ = this.$execute;
}
