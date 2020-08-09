import { DocumentClient } from "aws-sdk/clients/dynamodb";

import { Condition } from "../../types/conditions";
import {
  DynatronConstructorParams,
  FullReturnValues,
  ReturnValues,
} from "../../types/request";
import { BUILD, BUILD_PARAMS } from "../utils/constants";
import { optimizeRequestParams } from "../utils/expression-optimization-utils";
import { validateKey } from "../utils/misc-utils";
import { Mutator } from "./_Mutator";

export class Checker extends Mutator {
  #ConditionExpression?: Condition[];
  #ReturnValues?: ReturnValues;

  constructor(
    params: DynatronConstructorParams,
    protected key: DocumentClient.Key,
  ) {
    super(params);
    validateKey(key);
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
      Key: this.key,
      TableName: this.params.table,
      ...optimizeRequestParams(requestParams),
    };
  }
}
