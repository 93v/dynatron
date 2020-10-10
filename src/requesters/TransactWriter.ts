import retry from "async-retry";
import {
  ClientRequestToken,
  DocumentClient,
  TransactWriteItem,
  TransactWriteItemsInput,
} from "aws-sdk/clients/dynamodb";

import {
  BUILD,
  BUILD_PARAMS,
  LONG_MAX_LATENCY,
  RETRY_OPTIONS,
  TAKING_TOO_LONG_EXCEPTION,
} from "../utils/constants";
import { optimizeRequestParams } from "../utils/expression-optimization-utils";
import { isRetryableDBError, QuickFail } from "../utils/misc-utils";
import { Mutator } from "./_Mutator";
import { Checker } from "./Checker";
import { Deleter } from "./Deleter";
import { Putter } from "./Putter";
import { Updater } from "./Updater";

export class TransactWriter extends Mutator {
  #ClientRequestToken?: ClientRequestToken;

  constructor(
    DB: DocumentClient,
    table: string,
    private items: (Checker | Putter | Deleter | Updater)[],
  ) {
    super(DB, table);
  }

  clientRequestToken = (clientRequestToken: ClientRequestToken) => {
    this.#ClientRequestToken = clientRequestToken;
    return this;
  };

  [BUILD]() {
    return {
      ...super[BUILD](),
      ...(this.#ClientRequestToken
        ? { ClientRequestToken: this.#ClientRequestToken }
        : {}),
    };
  }

  [BUILD_PARAMS]() {
    let requestParams = super[BUILD_PARAMS]();

    if (this.items.length === 0) {
      throw new Error("At least one transaction must be provided");
    }
    if (this.items.length > 25) {
      throw new Error("No more than 25 transactions can be provided");
    }
    const supportedParamsByAll = [
      "ConditionExpression",
      "TableName",
      "ExpressionAttributeNames",
      "ExpressionAttributeValues",
      "ReturnValues",
    ];
    const transactWriteActionConfigs = {
      Checker: {
        requestName: "ConditionCheck",
        supportedParams: ["Key"],
      },
      Deleter: { requestName: "Delete", supportedParams: ["Key"] },
      Putter: { requestName: "Put", supportedParams: ["Item"] },
      Updater: {
        requestName: "Update",
        supportedParams: ["Key", "UpdateExpression"],
      },
    };
    requestParams = {
      TransactItems: this.items.map((item) => {
        const transactItem = item[BUILD_PARAMS]();
        Object.keys(transactItem).forEach((k) => {
          if (
            !supportedParamsByAll.includes(k) &&
            !transactWriteActionConfigs[
              item.constructor.name
            ].supportedParams.includes(k)
          ) {
            delete transactItem[k];
          }
        });
        if (transactItem.ReturnValues) {
          transactItem.ReturnValuesOnConditionCheckFailure =
            transactItem.ReturnValues === "ALL_NEW" ? "ALL_OLD" : "NONE";
          delete transactItem.ReturnValues;
        }
        return {
          [transactWriteActionConfigs[item.constructor.name]
            .requestName]: transactItem,
        } as TransactWriteItem;
      }),
      ...(requestParams.ClientRequestToken
        ? { ClientRequestToken: requestParams.ClientRequestToken }
        : {}),
      ...(requestParams.ReturnConsumedCapacity
        ? {
            ReturnConsumedCapacity: requestParams.ReturnConsumedCapacity,
          }
        : {}),
      ...(requestParams.ReturnItemCollectionMetrics
        ? {
            ReturnItemCollectionMetrics:
              requestParams.ReturnItemCollectionMetrics,
          }
        : {}),
    };

    return { ...optimizeRequestParams(requestParams) };
  }

  $execute = async () => {
    return retry(async (bail, attempt) => {
      const qf = new QuickFail(
        attempt * LONG_MAX_LATENCY * (this.patienceRatio || 1),
        new Error(TAKING_TOO_LONG_EXCEPTION),
      );
      try {
        const result = await Promise.race([
          this.DB.transactWrite(
            this[BUILD_PARAMS]() as TransactWriteItemsInput,
          ).promise(),
          qf.wait(),
        ]);
        return result;
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
