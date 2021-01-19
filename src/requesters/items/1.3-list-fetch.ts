import { Condition } from "../../../types/conditions";
import { isConditionEmptyDeep } from "../../condition-expression-builders";
import { NativeValue } from "../../dynatron";
import { BUILD } from "../../utils/misc-utils";
import { Fetch } from "./1-fetch";

export class ListFetch extends Fetch {
  #ExclusiveStartKey?: NativeValue;
  #FilterExpressions?: Condition[];
  #IndexName?: string;
  #Limit?: number;

  where = (...conditions: (Condition | Condition[] | undefined)[]) => {
    if (isConditionEmptyDeep(conditions)) {
      return this;
    }
    this.#FilterExpressions = conditions.reduce(
      (aggregatedConditions: Condition[], condition) => {
        if (condition == undefined) {
          return aggregatedConditions;
        }
        return [
          ...aggregatedConditions,
          ...(Array.isArray(condition) ? condition : [condition]),
        ];
      },
      this.#FilterExpressions || [],
    );
    return this;
  };

  indexName = (indexName: string) => {
    this.#IndexName = indexName;
    return this;
  };

  limit = (limit: number) => {
    this.#Limit = limit;
    return this;
  };

  start = (exclusiveStartKey?: NativeValue) => {
    if (exclusiveStartKey != undefined) {
      this.#ExclusiveStartKey = exclusiveStartKey;
    }
    return this;
  };

  [BUILD]() {
    return {
      ...super[BUILD](),
      ...(this.#FilterExpressions?.length && {
        _FilterExpressions: this.#FilterExpressions,
      }),
      ...(this.#IndexName && { IndexName: this.#IndexName }),
      ...(this.#Limit && { Limit: this.#Limit }),
      ...(this.#ExclusiveStartKey && {
        _ExclusiveStartKey: this.#ExclusiveStartKey,
      }),
    };
  }
}
