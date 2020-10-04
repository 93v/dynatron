import retry from "async-retry";
import DynamoDB, { DeleteTableInput } from "aws-sdk/clients/dynamodb";

import {
  BUILD_PARAMS,
  LONG_MAX_LATENCY,
  RETRY_OPTIONS,
  TAKING_TOO_LONG_EXCEPTION,
} from "../../utils/constants";
import { isRetryableDBError, QuickFail } from "../../utils/misc-utils";

export class TableDeleter {
  constructor(protected readonly DB: DynamoDB, protected table: string) {}

  [BUILD_PARAMS]() {
    return { TableName: this.table };
  }

  $execute = async () => {
    return retry(async (bail, attempt) => {
      const qf = new QuickFail(
        attempt * LONG_MAX_LATENCY,
        new Error(TAKING_TOO_LONG_EXCEPTION),
      );
      try {
        const response = await Promise.race([
          this.DB.deleteTable(
            this[BUILD_PARAMS]() as DeleteTableInput,
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
