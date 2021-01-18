import {
  DynamoDBClient,
  GetItemCommand,
  GetItemCommandInput,
  GetItemOutput,
} from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import retry from "async-retry";

import { NativeKey, NativeValue } from "../../types/native-types";
import {
  BUILD,
  MARSHALL_REQUEST,
  RETRY_OPTIONS,
  SHORT_MAX_LATENCY,
  TAKING_TOO_LONG_EXCEPTION,
} from "../utils/constants";
import { isRetryableError } from "../utils/misc-utils";
import { createShortCircuit } from "../utils/short-circuit";
import { Fetch } from "./1-fetch";

export class Get extends Fetch {
  constructor(
    databaseClient: DynamoDBClient,
    tableName: string,
    private key: NativeKey,
  ) {
    super(databaseClient, tableName);
  }

  [BUILD]() {
    return {
      ...super[BUILD](),
      _Key: this.key,
    };
  }

  // TODO: create a base marshall function to use for all
  // TODO: validate key in that place

  $execute = async <T = NativeValue | undefined, U extends boolean = false>(
    returnRawResponse?: U,
  ): Promise<U extends true ? GetItemOutput : T | undefined> => {
    const requestInput = super[MARSHALL_REQUEST]<GetItemCommandInput>(
      this[BUILD](),
    );
    return retry(async (bail, attempt) => {
      const shortCircuit = createShortCircuit({
        duration: attempt * SHORT_MAX_LATENCY,
        error: new Error(TAKING_TOO_LONG_EXCEPTION),
      });
      try {
        const { $metadata, ...output } = await Promise.race([
          this.databaseClient.send(new GetItemCommand(requestInput)),
          shortCircuit.launch(),
        ]);

        return (returnRawResponse
          ? output
          : output.Item && unmarshall(output.Item)) as any;
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
