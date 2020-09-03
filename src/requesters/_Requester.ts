import { DocumentClient } from "aws-sdk/clients/dynamodb";

import { RequestParams, ReturnConsumedCapacity } from "../../types/request";
import { BUILD, BUILD_PARAMS } from "../utils/constants";
import {
  cleanupEmptyExpressions,
  convertRawConditionExpressions,
  convertRawProjectionExpression,
  convertRawUpdateExpression,
} from "../utils/request-params-utils";

export class Requester {
  #ReturnConsumedCapacity?: ReturnConsumedCapacity;

  constructor(protected readonly DB: DocumentClient, protected table: string) {}

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
