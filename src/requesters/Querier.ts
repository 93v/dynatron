import retry from "async-retry";
import {
  BooleanObject,
  DocumentClient,
  ItemList,
  QueryInput,
  QueryOutput,
} from "aws-sdk/clients/dynamodb";

import { DynatronConstructorParams } from "..";
import { KeyCondition } from "../../types/conditions";
import {
  BUILD,
  BUILD_PARAMS,
  LONG_MAX_LATENCY,
  RETRY_OPTIONS,
  TAKING_TOO_LONG_EXCEPTION,
} from "../utils/constants";
import { optimizeRequestParams } from "../utils/expression-optimization-utils";
import {
  isRetryableDBError,
  quickFail,
  validateKey,
} from "../utils/misc-utils";
import { MultiGetter } from "./_MultiGetter";

export class Querier extends MultiGetter {
  #KeyConditionExpression?: KeyCondition;
  #ScanIndexForward?: BooleanObject;

  constructor(
    params: DynatronConstructorParams,
    private key: DocumentClient.Key,
  ) {
    super(params);
    validateKey(key);
  }

  having = (keyCondition: KeyCondition | undefined | null) => {
    if (keyCondition != null) {
      this.#KeyConditionExpression = keyCondition;
    }
    return this;
  };

  sort = (sort: "ASC" | "DSC") => {
    if (sort == "DSC") {
      this.#ScanIndexForward = false;
    }
    return this;
  };

  [BUILD]() {
    return {
      ...super[BUILD](),
      ...(this.#KeyConditionExpression
        ? { RawKeyConditionExpression: [this.#KeyConditionExpression] }
        : {}),
      ...(this.#ScanIndexForward != null
        ? { ScanIndexForward: this.#ScanIndexForward }
        : {}),
    };
  }

  [BUILD_PARAMS]() {
    const requestParams = super[BUILD_PARAMS](this.key);

    return {
      TableName: this.params.table,
      ...optimizeRequestParams(requestParams),
    };
  }

  $execute = async <T = ItemList | undefined | null, U extends boolean = false>(
    returnRawResponse?: U,
  ): Promise<U extends true ? QueryOutput : T | undefined | null> => {
    const params = { ...(this[BUILD_PARAMS]() as QueryInput) };

    if (params.IndexName) {
      delete params.ConsistentRead;
    }
    let scanCompleted = false;
    const response: QueryOutput = {};
    return retry(async (bail, attempt) => {
      try {
        while (!scanCompleted) {
          const result = await Promise.race([
            this.DB.query(params).promise(),
            quickFail(
              attempt * LONG_MAX_LATENCY,
              new Error(TAKING_TOO_LONG_EXCEPTION),
            ),
          ]);
          if (result.LastEvaluatedKey == null) {
            scanCompleted = true;
          } else {
            params.ExclusiveStartKey = result.LastEvaluatedKey;
          }
          if (result.Items) {
            response.Items = [...(response.Items || []), ...result.Items];
          }
          if (result.Count) {
            response.Count = (response.Count || 0) + result.Count;
          }
          if (result.ScannedCount) {
            response.ScannedCount =
              (response.ScannedCount || 0) + result.ScannedCount;
          }
          if (result.ConsumedCapacity) {
            if (!response.ConsumedCapacity) {
              response.ConsumedCapacity = result.ConsumedCapacity;
            } else {
              response.ConsumedCapacity.CapacityUnits =
                (response.ConsumedCapacity.CapacityUnits || 0) +
                (result.ConsumedCapacity?.CapacityUnits || 0);
            }
          }
          if (params.Limit && (response.Items?.length || 0) >= params.Limit) {
            response.Items = response.Items?.slice(0, params.Limit);
            response.Count = response.Items?.length || 0;
            scanCompleted = true;
          }
        }
        return (returnRawResponse ? response : response.Items) as any;
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
