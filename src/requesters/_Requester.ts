import { DocumentClient } from "aws-sdk/clients/dynamodb";

import {
  DynatronConstructorParams,
  RequestParams,
  ReturnConsumedCapacity,
} from "../../types/request";
import { BUILD, BUILD_PARAMS } from "../utils/constants";
import { initDocumentClient } from "../utils/misc-utils";
import {
  cleanupEmptyExpressions,
  convertRawConditionExpressions,
  convertRawProjectionExpression,
  convertRawUpdateExpression,
} from "../utils/request-params-utils";

export class Requester {
  #ReturnConsumedCapacity?: ReturnConsumedCapacity;

  protected readonly DB: DocumentClient;

  constructor(protected params: DynatronConstructorParams) {
    this.DB = initDocumentClient(params.clientConfigs);
  }

  returnConsumedCapacity = (
    returnConsumedCapacity: ReturnConsumedCapacity = "TOTAL",
  ) => {
    this.#ReturnConsumedCapacity = returnConsumedCapacity;
    return this;
  };

  [BUILD]() {
    return {
      ...(this.#ReturnConsumedCapacity
        ? { ReturnConsumedCapacity: this.#ReturnConsumedCapacity }
        : {}),
    };
  }

  [BUILD_PARAMS](queryKey?: DocumentClient.Key) {
    const requestParams: RequestParams = this[BUILD]();

    return cleanupEmptyExpressions(
      convertRawUpdateExpression(
        convertRawConditionExpressions(
          convertRawProjectionExpression(
            Object.keys(requestParams).reduce(
              (p: RequestParams, c) => ({
                ...p,
                ...(requestParams[c] ? { [c]: requestParams[c] } : {}),
              }),
              {},
            ),
          ),
          queryKey,
        ),
      ),
    );
  }
}
