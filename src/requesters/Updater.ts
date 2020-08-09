import retry from "async-retry";
import {
  AttributeMap,
  DocumentClient,
  UpdateItemInput,
  UpdateItemOutput,
} from "aws-sdk/clients/dynamodb";

import { Condition } from "../../types/conditions";
import { FullReturnValues } from "../../types/request";
import {
  Update,
  UpdateAdd,
  UpdateAppend,
  UpdateDecrement,
  UpdateDelete,
  UpdateIncrement,
  UpdatePrepend,
  UpdateRemove,
  UpdateSet,
} from "../../types/update";
import { serializeAttributePath } from "../utils/attribute-path-utils";
import {
  BUILD,
  BUILD_PARAMS,
  RETRY_OPTIONS,
  SHORT_MAX_LATENCY,
  TAKING_TOO_LONG_EXCEPTION,
  UpdateKind,
} from "../utils/constants";
import { optimizeRequestParams } from "../utils/expression-optimization-utils";
import { isRetryableDBError, quickFail } from "../utils/misc-utils";
import { Checker } from "./Checker";

export class Updater extends Checker {
  #ConditionExpression?: Condition[];
  #ReturnValues?: FullReturnValues;
  #UpdateExpression: Update[] = [];

  returnValues = (returnValues: FullReturnValues = "ALL_NEW") => {
    this.#ReturnValues = returnValues;
    return this;
  };

  private set(
    path: string,
    value: DocumentClient.AttributeValue,
    ifNotExist = false,
  ) {
    const expression: UpdateSet = {
      kind: UpdateKind.Set,
      path,
      value,
      ifNotExist,
    };
    this.#UpdateExpression.push(expression);
    return this;
  }

  private remove(path: string | string[]) {
    if (!Array.isArray(path)) {
      path = [path];
    }

    path.forEach((p) => {
      const expression: UpdateRemove = {
        kind: UpdateKind.Remove,
        path: p,
      };
      this.#UpdateExpression.push(expression);
    });
    return this;
  }

  private delete(path: string, value: DocumentClient.DynamoDbSet) {
    const serializedPath = serializeAttributePath(path);
    if (
      serializedPath.expression.includes(".") ||
      (serializedPath.expression.includes("[") &&
        serializedPath.expression.endsWith("]"))
    ) {
      throw new Error("DELETE can only be used on top-level attributes");
    }
    const expression: UpdateDelete = {
      kind: UpdateKind.Delete,
      path,
      value,
    };
    this.#UpdateExpression.push(expression);
    return this;
  }

  add(
    path: string,
    value:
      | DocumentClient.DynamoDbSet
      | (string | number | DocumentClient.binaryType)
      | (string | number | DocumentClient.binaryType)[],
  ) {
    const serializedPath = serializeAttributePath(path);
    if (
      serializedPath.expression.includes(".") ||
      (serializedPath.expression.includes("[") &&
        serializedPath.expression.endsWith("]"))
    ) {
      throw new Error("ADD can only be used on top-level attributes");
    }

    const setValue: DocumentClient.DynamoDbSet =
      value && value.constructor.name !== "Set" && typeof value !== "number"
        ? new DocumentClient().createSet(Array.isArray(value) ? value : [value])
        : (value as DocumentClient.DynamoDbSet);

    const expression: UpdateAdd = {
      kind: UpdateKind.Add,
      path,
      value: setValue,
    };
    this.#UpdateExpression.push(expression);
    return this;
  }

  increment(path: string, value: number, attributeExists = true) {
    const expression = attributeExists
      ? ({
          kind: UpdateKind.Increment,
          path,
          value,
        } as UpdateIncrement)
      : ({
          kind: UpdateKind.Add,
          path,
          value,
        } as UpdateAdd);
    this.#UpdateExpression.push(expression);
    return this;
  }

  decrement(path: string, value: number, attributeExists = true) {
    const expression = attributeExists
      ? ({
          kind: UpdateKind.Decrement,
          path,
          value,
        } as UpdateDecrement)
      : ({
          kind: UpdateKind.Add,
          path,
          value: -1 * value,
        } as UpdateAdd);
    this.#UpdateExpression.push(expression);
    return this;
  }

  assign(item: DocumentClient.PutItemInputAttributeMap, ifNotExist = false) {
    Object.keys(item).forEach((key) => {
      this.set(key, item[key], ifNotExist);
    });
    return this;
  }

  append(
    path: string,
    value: DocumentClient.AttributeValue | DocumentClient.AttributeValue[],
  ) {
    const expression: UpdateAppend = {
      kind: UpdateKind.Append,
      path,
      value: Array.isArray(value) ? value : [value],
    };
    this.#UpdateExpression.push(expression);
    return this;
  }

  prepend(
    path: string,
    value: DocumentClient.AttributeValue | DocumentClient.AttributeValue[],
  ) {
    const expression: UpdatePrepend = {
      kind: UpdateKind.Prepend,
      path,
      value: Array.isArray(value) ? value : [value],
    };
    this.#UpdateExpression.push(expression);
    return this;
  }

  drop(
    path: string,
    value?:
      | DocumentClient.DynamoDbSet
      | (string | number | DocumentClient.binaryType)
      | (string | number | DocumentClient.binaryType)[],
  ) {
    const setValue: DocumentClient.DynamoDbSet | undefined =
      value && value.constructor.name !== "Set"
        ? new DocumentClient().createSet(Array.isArray(value) ? value : [value])
        : (value as DocumentClient.DynamoDbSet);
    return setValue == null ? this.remove(path) : this.delete(path, setValue);
  }

  [BUILD]() {
    return {
      ...super[BUILD](),
      ...(this.#ConditionExpression
        ? { RawConditionExpression: this.#ConditionExpression }
        : {}),
      ...(this.#ReturnValues ? { ReturnValues: this.#ReturnValues } : {}),
      ...(this.#UpdateExpression.length > 0
        ? { RawUpdateExpression: this.#UpdateExpression }
        : {}),
      ...(this.#ReturnValues ? { ReturnValues: this.#ReturnValues } : {}),
    };
  }

  [BUILD_PARAMS]() {
    const requestParams = super[BUILD_PARAMS]();

    if (!requestParams.UpdateExpression) {
      throw new Error("Update request should have at least one update action");
    }

    return {
      Key: this.key,
      TableName: this.params.table,
      ...optimizeRequestParams(requestParams),
    };
  }

  $execute = async <
    T = AttributeMap | undefined | null,
    U extends boolean = false
  >(
    returnRawResponse?: U,
  ): Promise<U extends true ? UpdateItemOutput : T | undefined | null> => {
    return retry(async (bail, attempt) => {
      try {
        const response = await Promise.race([
          this.DB.update(this[BUILD_PARAMS]() as UpdateItemInput).promise(),
          quickFail(
            attempt * SHORT_MAX_LATENCY,
            new Error(TAKING_TOO_LONG_EXCEPTION),
          ),
        ]);
        return (returnRawResponse ? response : response.Attributes) as any;
      } catch (ex) {
        if (!isRetryableDBError(ex)) {
          bail(ex);
          return;
        }
        throw ex;
      }
    }, RETRY_OPTIONS);
  };

  $ = this.$execute;
}
