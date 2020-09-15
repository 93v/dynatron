import { DocumentClient } from "aws-sdk/clients/dynamodb";

import { Condition } from "../../types/conditions";
import { FullReturnValues, ReturnValues } from "../../types/request";
import { isConditionEmptyDeep } from "../utils/condition-expression-utils";
import { BUILD, BUILD_PARAMS } from "../utils/constants";
import { optimizeRequestParams } from "../utils/expression-optimization-utils";
import { validateKey } from "../utils/misc-utils";
import { Mutator } from "./_Mutator";

export class Checker extends Mutator {
  #ConditionExpression?: Condition[];
  #ReturnValues?: ReturnValues;

  constructor(
    DB: DocumentClient,
    table: string,
    protected key: DocumentClient.Key,
  ) {
    super(DB, table);
    validateKey(key);
  }

  returnValues = (returnValues: ReturnValues = "ALL_OLD") => {
    this.#ReturnValues = returnValues;
    return this;
  };

  if = (...args: (Condition | Condition[] | undefined | null)[]) => {
    if (isConditionEmptyDeep(args)) {
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
      TableName: this.table,
      ...optimizeRequestParams(requestParams),
    };
  }
}
