import retry from "async-retry";
import {
  DocumentClient,
  ItemList,
  TransactGetItem,
  TransactGetItemsInput,
  TransactGetItemsOutput,
} from "aws-sdk/clients/dynamodb";

import {
  BUILD_PARAMS,
  LONG_MAX_LATENCY,
  RETRY_OPTIONS,
  TAKING_TOO_LONG_EXCEPTION,
} from "../utils/constants";
import { optimizeRequestParams } from "../utils/expression-optimization-utils";
import { isRetryableDBError, QuickFail } from "../utils/misc-utils";
import { Requester } from "./_Requester";
import { Getter } from "./Getter";

export class TransactGetter extends Requester {
  constructor(DB: DocumentClient, table: string, private items: Getter[]) {
    super(DB, table);
  }

  [BUILD_PARAMS]() {
    let requestParams = super[BUILD_PARAMS]();

    if (this.items.length === 0) {
      throw new Error("At least one transaction must be provided");
    }
    if (this.items.length > 25) {
      throw new Error("No more than 25 transactions can be provided");
    }
    const supportedParams = [
      "Key",
      "TableName",
      "ExpressionAttributeNames",
      "ProjectionExpression",
    ];
    requestParams = {
      TransactItems: this.items.map((item) => {
        const transactItem = item[BUILD_PARAMS]();
        Object.keys(transactItem).forEach((k) => {
          if (!supportedParams.includes(k)) {
            delete transactItem[k];
          }
        });
        return { Get: transactItem } as TransactGetItem;
      }),
      ...(requestParams.ReturnConsumedCapacity
        ? {
            ReturnConsumedCapacity: requestParams.ReturnConsumedCapacity,
          }
        : {}),
    };

    return { ...optimizeRequestParams(requestParams) };
  }

  $execute = async <T = ItemList | undefined | null, U extends boolean = false>(
    returnRawResponse?: U,
  ): Promise<
    U extends true ? TransactGetItemsOutput : T | undefined | null
  > => {
    return retry(async (bail, attempt) => {
      const qf = new QuickFail(
        attempt * LONG_MAX_LATENCY,
        new Error(TAKING_TOO_LONG_EXCEPTION),
      );
      try {
        const response = await Promise.race([
          this.DB.transactGet(
            this[BUILD_PARAMS]() as TransactGetItemsInput,
          ).promise(),
          qf.wait(),
        ]);
        return (returnRawResponse
          ? response
          : response.Responses?.map((r) => r.Item)) as any;
      } catch (ex) {
        if (!isRetryableDBError(ex)) {
          bail(ex);
          return;
        }
        throw ex;
      } finally {
        qf.cancel();
      }
    }, RETRY_OPTIONS);
  };

  $ = this.$execute;
}
