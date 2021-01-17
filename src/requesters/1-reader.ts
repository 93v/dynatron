import { BUILD } from "../utils/constants";
import { Requester } from "./0-requester";

export class Reader extends Requester {
  #ConsistentRead?: boolean;
  #ProjectionExpressions?: string[];

  consistentRead = (consistentRead = true) => {
    this.#ConsistentRead = consistentRead;
    return this;
  };

  select = (...attributePaths: (string | string[] | undefined | null)[]) => {
    if (
      attributePaths.every((attributePath) => attributePath == undefined) ||
      attributePaths.flat().length === 0
    ) {
      return this;
    }

    attributePaths.forEach((attributePath) => {
      if (typeof attributePath === "string") {
        attributePath = [attributePath];
      }
      this.#ProjectionExpressions = [
        ...new Set([
          ...(this.#ProjectionExpressions || []),
          ...(attributePath || []),
        ]),
      ];
    });
    return this;
  };

  [BUILD]() {
    return {
      ...super[BUILD](),
      ...(this.#ConsistentRead && { ConsistentRead: this.#ConsistentRead }),
      ...(this.#ProjectionExpressions?.length && {
        _ProjectionExpressions: this.#ProjectionExpressions,
      }),
    };
  }
}
