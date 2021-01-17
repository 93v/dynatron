import { Options } from "async-retry";

export const BUILD: unique symbol = Symbol("Build._build");
export const BUILD_REQUEST_INPUT: unique symbol = Symbol(
  "BuildRequestInput._buildRequestInput",
);

export const MILLISECONDS_IN_SECOND = 1000;

export const TAKING_TOO_LONG_EXCEPTION = "TakingTooLongException";

export const BATCH_OPTIONS = {
  WRITE_LIMIT: 25,
  GET_LIMIT: 100,
};

export const RETRY_OPTIONS: Options = {
  minTimeout: 50,
  retries: 5,
};

export const SHORT_MAX_LATENCY = MILLISECONDS_IN_SECOND;
export const LONG_MAX_LATENCY = 10 * MILLISECONDS_IN_SECOND;
