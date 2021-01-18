import { ReturnItemCollectionMetrics } from "@aws-sdk/client-dynamodb";

import { BUILD } from "../../utils/constants";
import { Request } from "./0-request";

export class Amend extends Request {
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
