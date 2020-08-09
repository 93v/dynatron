import { ReturnItemCollectionMetrics } from "../../types/request";
import { BUILD } from "../utils/constants";
import { Requester } from "./_Requester";

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
      ...(this.#ReturnItemCollectionMetrics
        ? { ReturnItemCollectionMetrics: this.#ReturnItemCollectionMetrics }
        : {}),
    };
  }
}
