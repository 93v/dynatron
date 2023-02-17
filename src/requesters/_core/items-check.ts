import { ReturnValue } from "@aws-sdk/client-dynamodb";

import { Condition } from "../../../types/conditions";
import { isConditionEmptyDeep } from "../../condition-expression-builders";
import { DynatronClient, NativeValue } from "../../dynatron";
import { BUILD, validateKey } from "../../utils/misc-utils";
import { Amend } from "./items-amend";

export class Check extends Amend {
  #ConditionExpressions?: Condition[];
  #ReturnValues?: ReturnValue;

  constructor(
    databaseClient: DynatronClient,
    tableName: string,
    protected key?: NativeValue,
  ) {
    super(databaseClient, tableName);
    key && validateKey(key);
  }

  /**
   * Use ReturnValues if you want to get the item attributes as they appear before or after they are updated. For
   * UpdateItem, the valid values are:
   *
   * NONE - If ReturnValues is not specified, or if its value is NONE, then nothing is returned. (This setting is the
   * default for ReturnValues.)
   * ALL_OLD - Returns all attributes of the item, as they appeared before the UpdateItem operation.
   * UPDATED_OLD - Returns only the updated attributes, as they appeared before the UpdateItem operation.
   * ALL_NEW - Returns all attributes of the item, as they appear after the UpdateItem operation.
   * UPDATED_NEW - Returns only the updated attributes, as they appear after the UpdateItem operation.
   *
   * There is no additional cost associated with requesting a return value aside from the small network and processing
   * overhead of receiving a larger response. No read capacity units are consumed.
   *
   * The values returned are strongly consistent.
   * @param returnValues NONE | ALL_OLD | UPDATED_OLD | ALL_NEW | UPDATED_NEW
   * @returns Check
   */
  returnValues = (returnValues: ReturnValue = ReturnValue.ALL_NEW) => {
    this.#ReturnValues = returnValues;
    return this;
  };

  /**
   * Sets conditions to check during execution
   * @param conditions (Condition | Condition[] | undefined)[]
   * @returns Check
   */
  if = (...conditions: (Condition | Condition[] | undefined)[]) => {
    if (!isConditionEmptyDeep(conditions)) {
      this.#ConditionExpressions = [
        ...(this.#ConditionExpressions ?? []),
        ...conditions
          .flatMap((c) => (Array.isArray(c) ? c : [c]))
          .filter((c): c is Condition => c != undefined),
      ];
    }
    return this;
  };

  [BUILD]() {
    return {
      ...super[BUILD](),
      ...(this.key && { _Key: this.key }),
      ...(this.#ConditionExpressions?.length && {
        _ConditionExpressions: this.#ConditionExpressions,
      }),
      ReturnValues:
        this.#ReturnValues ||
        (this.constructor.name === "Update"
          ? ReturnValue.ALL_NEW
          : ReturnValue.NONE),
    };
  }
}
