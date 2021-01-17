import { ReturnItemCollectionMetrics } from "@aws-sdk/client-dynamodb";

import { BUILD } from "../utils/constants";
import { Requester } from "./0-requester";

export class Mutator extends Requester {
  #ReturnItemCollectionMetrics?: ReturnItemCollectionMetrics;

  returnItemCollectionMetrics = (
    returnItemCollectionMetrics: ReturnItemCollectionMetrics = "SIZE",
  ) => {
    this.#ReturnItemCollectionMetrics = returnItemCollectionMetrics;
    return this;
  };

  [BUILD]() {
    return {
      ...super[BUILD](),
      ...(this.#ReturnItemCollectionMetrics && {
        ReturnItemCollectionMetrics: this.#ReturnItemCollectionMetrics,
      }),
    };
  }
}
