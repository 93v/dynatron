import {
  DynamoDBClient,
  PutItemCommand,
  PutItemCommandInput,
  PutItemOutput,
} from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import retry from "async-retry";

import { NativeValue } from "../../types/native-types";
import {
  BUILD,
  MARSHALL_REQUEST,
  RETRY_OPTIONS,
  SHORT_MAX_LATENCY,
  TAKING_TOO_LONG_EXCEPTION,
} from "../utils/constants";
import { isRetryableError } from "../utils/misc-utils";
import { createShortCircuit } from "../utils/short-circuit";
import { Check } from "./2.1-check";

export class Put extends Check {
  constructor(
    databaseClient: DynamoDBClient,
    tableName: string,
    private item: NativeValue,
  ) {
    super(databaseClient, tableName);
  }

  [BUILD]() {
    return {
      ...super[BUILD](),
      _Item: marshall(this.item),
    };
  }

  $execute = async <T = NativeValue | undefined, U extends boolean = false>(
    returnRawResponse?: U,
  ): Promise<U extends true ? PutItemOutput : T | undefined> => {
    const requestInput = super[MARSHALL_REQUEST]<PutItemCommandInput>(
      this[BUILD](),
    );
    return retry(async (bail, attempt) => {
      const shortCircuit = createShortCircuit({
        duration: attempt * SHORT_MAX_LATENCY,
        error: new Error(TAKING_TOO_LONG_EXCEPTION),
      });
      try {
        const { $metadata, ...output } = await Promise.race([
          this.databaseClient.send(new PutItemCommand(requestInput)),
          shortCircuit.launch(),
        ]);

        return (returnRawResponse ? output : this.item) as any;
      } catch (error) {
        if (!isRetryableError(error)) {
          bail(error);
          return;
        }
        throw error;
      } finally {
        shortCircuit.halt();
      }
    }, RETRY_OPTIONS);
  };

  $ = this.$execute;
}
