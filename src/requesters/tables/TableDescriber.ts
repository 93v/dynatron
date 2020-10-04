import retry from "async-retry";
import DynamoDB, { DescribeTableInput } from "aws-sdk/clients/dynamodb";

import {
  BUILD_PARAMS,
  RETRY_OPTIONS,
  SHORT_MAX_LATENCY,
  TAKING_TOO_LONG_EXCEPTION,
} from "../../utils/constants";
import { isRetryableDBError, QuickFail } from "../../utils/misc-utils";

export class TableDescriber {
  constructor(protected readonly DB: DynamoDB, protected table: string) {}

  [BUILD_PARAMS]() {
    return { TableName: this.table };
  }

  $execute = async () => {
    return retry(async (bail, attempt) => {
      const qf = new QuickFail(
        attempt * SHORT_MAX_LATENCY,
        new Error(TAKING_TOO_LONG_EXCEPTION),
      );
      try {
        const response = await Promise.race([
          this.DB.describeTable(
            this[BUILD_PARAMS]() as DescribeTableInput,
          ).promise(),
          qf.wait(),
        ]);
        return response.Table;
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
