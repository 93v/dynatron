import { Condition } from "../../../types/conditions";
import { isConditionEmptyDeep } from "../../condition-expression-builders";
import { NativeValue } from "../../dynatron-class";
import { BUILD } from "../../utils/misc-utils";
import { Fetch } from "./1-fetch";

export class ListFetch extends Fetch {
  #ExclusiveStartKey?: NativeValue;
  #FilterExpressions?: Condition[];
  #IndexName?: string;
  #Limit?: number;

  /**
   * Sets conditions that DynamoDB applies after the database operation, but before the data is returned to you. Items that do not satisfy the FilterExpression criteria are not returned.
   * @param conditions Condition | Condition[]
   */
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
      this.#FilterExpressions ?? [],
    );
    return this;
  };

  /**
   * The name of a secondary index to scan. This index can be any local secondary index or global secondary index. Note that if you use the IndexName parameter, you must also provide TableName.
   * @param indexName string
   */
  indexName = (indexName: string) => {
    this.#IndexName = indexName;
    return this;
  };

  /**
   * The maximum number of items to evaluate (not necessarily the number of matching items). If DynamoDB processes the number of items up to the limit while processing the results, it stops the operation and returns the matching values up to that point, and a key in LastEvaluatedKey to apply in a subsequent operation, so that you can pick up where you left off. Also, if the processed dataset size exceeds 1 MB before DynamoDB reaches this limit, it stops the operation and returns the matching values up to the limit, and a key in LastEvaluatedKey to apply in a subsequent operation to continue the operation.
   * @param limit number
   */
  limit = (limit: number) => {
    this.#Limit = limit;
    return this;
  };

  /**
   * The primary key of the first item that this operation will evaluate. Use the value that was returned for LastEvaluatedKey in the previous operation.
   *
   * The data type for ExclusiveStartKey must be String, Number or Binary. No set data types are allowed.
   *
   * In a parallel scan, a Scan request that includes ExclusiveStartKey must specify the same segment whose previous Scan returned the corresponding value of LastEvaluatedKey.
   * @param exclusiveStartKey NativeValue
   */
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
