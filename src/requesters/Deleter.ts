import retry from "async-retry";
import {
  AttributeMap,
  DeleteItemInput,
  DeleteItemOutput,
} from "aws-sdk/clients/dynamodb";

import {
  BUILD_PARAMS,
  RETRY_OPTIONS,
  SHORT_MAX_LATENCY,
  TAKING_TOO_LONG_EXCEPTION,
} from "../utils/constants";
import { isRetryableDBError, quickFail } from "../utils/misc-utils";
import { Checker } from "./Checker";

export class Deleter extends Checker {
  $execute = async <
    T = AttributeMap | undefined | null,
    U extends boolean = false
  >(
    returnRawResponse?: U,
  ): Promise<U extends true ? DeleteItemOutput : T | undefined | null> => {
    return retry(async (bail, attempt) => {
      try {
        const response = await Promise.race([
          this.DB.delete(this[BUILD_PARAMS]() as DeleteItemInput).promise(),
          quickFail(
            attempt * SHORT_MAX_LATENCY,
            new Error(TAKING_TOO_LONG_EXCEPTION),
          ),
        ]);
        return returnRawResponse ? response : (response.Attributes as any);
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
