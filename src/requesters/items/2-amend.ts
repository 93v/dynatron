import { ReturnItemCollectionMetrics } from "@aws-sdk/client-dynamodb";

import { BUILD } from "../../utils/misc-utils";
import { Request } from "./0-request";

export class Amend extends Request {
  #ReturnItemCollectionMetrics?: ReturnItemCollectionMetrics;

  /**
   * Determines whether item collection metrics are returned. If set to SIZE, the response includes statistics about item collections, if any, that were modified during the operation are returned in the response. If set to NONE (the default), no statistics are returned.
   * @param returnItemCollectionMetrics ReturnItemCollectionMetrics
   */
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
