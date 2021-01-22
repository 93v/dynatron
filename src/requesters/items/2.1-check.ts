import { DynamoDBClient, ReturnValue } from "@aws-sdk/client-dynamodb";

import { Condition } from "../../../types/conditions";
import { isConditionEmptyDeep } from "../../condition-expression-builders";
import { NativeValue } from "../../dynatron-class";
import { BUILD, validateKey } from "../../utils/misc-utils";
import { Amend } from "./2-amend";

export class Check extends Amend {
  #ConditionExpressions?: Condition[];
  #ReturnValues?: ReturnValue;

  constructor(
    databaseClient: DynamoDBClient,
    tableName: string,
    private key?: NativeValue,
  ) {
    super(databaseClient, tableName);
    key && validateKey(key);
  }

  returnValues = (returnValues: ReturnValue = "ALL_OLD") => {
    this.#ReturnValues = returnValues;
    return this;
  };

  if = (...conditions: (Condition | Condition[] | undefined)[]) => {
    if (isConditionEmptyDeep(conditions)) {
      return this;
    }
    this.#ConditionExpressions = conditions.reduce(
      (aggregatedConditions: Condition[], currentCondition) => {
        if (currentCondition == undefined) {
          return aggregatedConditions;
        }
        return [
          ...aggregatedConditions,
          ...(Array.isArray(currentCondition)
            ? currentCondition
            : [currentCondition]),
        ];
      },
      this.#ConditionExpressions || [],
    );
    return this;
  };

  [BUILD]() {
    return {
      ...super[BUILD](),
      ...(this.key && { _Key: this.key }),
      ...(this.#ConditionExpressions?.length && {
        _ConditionExpressions: this.#ConditionExpressions,
      }),
      ...(this.#ReturnValues && { ReturnValues: this.#ReturnValues }),
    };
  }
}
