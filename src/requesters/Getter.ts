import retry from "async-retry";
import {
  AttributeMap,
  ConsistentRead,
  DocumentClient,
  GetItemInput,
  GetItemOutput,
} from "aws-sdk/clients/dynamodb";

import {
  BUILD,
  BUILD_PARAMS,
  RETRY_OPTIONS,
  SHORT_MAX_LATENCY,
  TAKING_TOO_LONG_EXCEPTION,
} from "../utils/constants";
import { optimizeRequestParams } from "../utils/expression-optimization-utils";
import {
  isRetryableDBError,
  quickFail,
  validateKey,
} from "../utils/misc-utils";
import { Requester } from "./_Requester";

export class Getter extends Requester {
  #ConsistentRead?: ConsistentRead;
  #ProjectionExpression?: string[];

  constructor(
    DB: DocumentClient,
    table: string,
    private key: DocumentClient.Key,
  ) {
    super(DB, table);
    validateKey(key);
  }

  consistentRead = (consistentRead: ConsistentRead = true) => {
    this.#ConsistentRead = consistentRead;
    return this;
  };

  select = (...args: (string | string[] | undefined | null)[]) => {
    if (args.every((arg) => arg == null) || args.flat().length === 0) {
      return this;
    }

    args.forEach((projection) => {
      if (typeof projection === "string") {
        projection = [projection];
      }
      this.#ProjectionExpression = [
        ...new Set([
          ...(this.#ProjectionExpression || []),
          ...(projection || []),
        ]),
      ];
    });
    return this;
  };

  [BUILD]() {
    return {
      ...super[BUILD](),
      ...(this.#ConsistentRead ? { ConsistentRead: this.#ConsistentRead } : {}),
      ...(this.#ProjectionExpression
        ? { RawProjectionExpression: this.#ProjectionExpression }
        : {}),
    };
  }

  [BUILD_PARAMS]() {
    const requestParams = super[BUILD_PARAMS]();

    return {
      Key: this.key,
      TableName: this.table,
      ...optimizeRequestParams(requestParams),
    };
  }

  $execute = async <
    T = AttributeMap | undefined | null,
    U extends boolean = false
  >(
    returnRawResponse?: U,
  ): Promise<U extends true ? GetItemOutput : T | undefined | null> => {
    return retry(async (bail, attempt) => {
      try {
        const response = await Promise.race([
          this.DB.get(this[BUILD_PARAMS]() as GetItemInput).promise(),
          quickFail(
            attempt * SHORT_MAX_LATENCY,
            new Error(TAKING_TOO_LONG_EXCEPTION),
          ),
        ]);
        return (returnRawResponse ? response : response.Item) as any;
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
