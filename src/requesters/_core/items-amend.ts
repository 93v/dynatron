import { ReturnItemCollectionMetrics } from "@aws-sdk/client-dynamodb";

import { BUILD } from "../../utils/misc-utils";
import { ItemRequest } from "./items-request";

export class Amend extends ItemRequest {
  #ReturnItemCollectionMetrics?: ReturnItemCollectionMetrics;

  /**
   * Determines whether item collection metrics are returned. If set to SIZE, the response includes statistics about
   * item collections, if any, that were modified during the operation are returned with the response. If set to NONE
   * (the default), no statistics are returned.
   * @param returnItemCollectionMetrics ReturnItemCollectionMetrics
   */
  returnItemCollectionMetrics = (
    returnItemCollectionMetrics: ReturnItemCollectionMetrics = ReturnItemCollectionMetrics.SIZE,
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
