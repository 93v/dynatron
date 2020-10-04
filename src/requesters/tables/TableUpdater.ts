import retry from "async-retry";
import DynamoDB, { UpdateTableInput } from "aws-sdk/clients/dynamodb";

import {
  BUILD_PARAMS,
  LONG_MAX_LATENCY,
  RETRY_OPTIONS,
  TAKING_TOO_LONG_EXCEPTION,
} from "../../utils/constants";
import { isRetryableDBError, QuickFail } from "../../utils/misc-utils";

export class TableUpdater {
  constructor(private DB: DynamoDB, private params: UpdateTableInput) {}

  [BUILD_PARAMS]() {
    return { ...this.params };
  }

  $execute = async () => {
    return retry(async (bail, attempt) => {
      const qf = new QuickFail(
        attempt * LONG_MAX_LATENCY,
        new Error(TAKING_TOO_LONG_EXCEPTION),
      );
      try {
        const response = await Promise.race([
          this.DB.updateTable(
            this[BUILD_PARAMS]() as UpdateTableInput,
          ).promise(),
          qf.wait(),
        ]);
        return response.TableDescription;
      } catch (ex) {
        if (!isRetryableDBError(ex)) {
          bail(ex);
          return;
        }
        throw ex;
      } finally {
        qf.cancel();
      }
    }, RETRY_OPTIONS);
  };

  $ = this.$execute;
}
