import {
  DynamoDBClient,
  ReturnConsumedCapacity,
} from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { RequestParameters } from "../../types/request";

import { BUILD, MARSHALL_REQUEST } from "../utils/constants";

export class Request {
  #ReturnConsumedCapacity?: ReturnConsumedCapacity;
  protected patienceRatio = 1;

  constructor(
    protected readonly databaseClient: DynamoDBClient,
    protected tableName: string,
  ) {}

  returnConsumedCapacity = (
    returnConsumedCapacity: ReturnConsumedCapacity = "TOTAL",
  ) => {
    this.#ReturnConsumedCapacity = returnConsumedCapacity;
    return this;
  };

  relaxLatencies = (patienceRatio = 1) => {
    if (patienceRatio <= 0) {
      throw new Error("The ratio must be positive");
    }
    this.patienceRatio = Math.abs(patienceRatio);
    return this;
  };

  [BUILD]() {
    return {
      ...(this.#ReturnConsumedCapacity && {
        ReturnConsumedCapacity: this.#ReturnConsumedCapacity,
      }),
      TableName: this.tableName,
    };
  }

  [MARSHALL_REQUEST]<T>(requestParameters: RequestParameters) {
    // This will marshall and optimize the request
    // TODO: stricter type maybe?
    const marshalledParameters: Record<string, any> = {};

    if (requestParameters.TableName) {
      marshalledParameters.TableName = requestParameters.TableName;
    }

    if (requestParameters._Key) {
      marshalledParameters.Key = marshall(requestParameters._Key);
    }

    if (requestParameters._Item) {
      marshalledParameters.Item = marshall(requestParameters._Item);
    }

    return marshalledParameters as T;
  }
}
