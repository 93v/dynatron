import { ReturnConsumedCapacity } from "@aws-sdk/client-dynamodb";

import { BUILD } from "../utils/constants";

export class Requester {
  #ReturnConsumedCapacity?: ReturnConsumedCapacity;

  returnConsumedCapacity = (returnConsumedCapacity: ReturnConsumedCapacity) => {
    this.#ReturnConsumedCapacity = returnConsumedCapacity;
    return this;
  };

  [BUILD]() {
    return {
      ...(this.#ReturnConsumedCapacity && {
        ReturnConsumedCapacity: this.#ReturnConsumedCapacity,
      }),
    };
  }
}
