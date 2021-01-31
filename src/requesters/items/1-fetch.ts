import { BUILD } from "../../utils/misc-utils";
import { Request } from "./0-request";

export class Fetch extends Request {
  #ConsistentRead?: boolean;
  #ProjectionExpressions?: string[];

  /**
   * Determines the read consistency model: If set to true, then the operation uses strongly consistent reads; otherwise, the operation uses eventually consistent reads.
   * @param consistentRead boolean
   */
  consistentRead = (consistentRead = true) => {
    this.#ConsistentRead = consistentRead;
    return this;
  };

  /**
   * A string or an array of strings that identify one or more attributes to retrieve from the table. These attributes can include scalars, sets, or elements of a JSON document. The attributes in the expression must be separated by commas.
   *
   * If no attribute names are specified, then all attributes are returned. If any of the requested attributes are not found, they do not appear in the result.
   * @param attributePaths string | string[]
   */
  select = (...attributePaths: (string | string[] | undefined)[]) => {
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
          ...(this.#ProjectionExpressions ?? []),
          ...(attributePath ?? []),
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
