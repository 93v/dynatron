import { loadSharedConfigFiles } from "@aws-sdk/shared-ini-file-loader";
import { Options } from "async-retry";

import { NativeValue } from "../dynatron";

export const BUILD: unique symbol = Symbol("Build._build");

export const TAKING_TOO_LONG_EXCEPTION = "TakingTooLongException";

export const RETRY_OPTIONS: Options = { minTimeout: 50, retries: 5 };

const MILLISECONDS_IN_SECOND = 1000;
export const SHORT_MAX_LATENCY = MILLISECONDS_IN_SECOND;
export const LONG_MAX_LATENCY = 10 * SHORT_MAX_LATENCY;

export const assertNever = (object: never): never => {
  throw new Error(`Unexpected value: ${JSON.stringify(object)}`);
};

export const isRetryableError = (error: Error) =>
  error.message === TAKING_TOO_LONG_EXCEPTION ||
  (Object.prototype.hasOwnProperty.call(error, "retryable") &&
    (error as any).retryable) ||
  ["ECONN", "NetworkingError", "InternalServerError"].some((message) =>
    error.toString().toUpperCase().includes(message.toUpperCase()),
  ) ||
  (Object.prototype.hasOwnProperty.call(error, "code") &&
    ["ProvisionedThroughputExceededException", "ThrottlingException"].includes(
      (error as any).code,
    ));

export const validateKey = (key: NativeValue) => {
  const keysLength = Object.keys(key).length;
  if (keysLength === 0) {
    throw new Error("At least 1 property must be present in the key");
  }
  if (keysLength > 2) {
    throw new Error(`At most 2 properties must be present in the key`);
  }
};

export const loadProfileCredentials = async (profile: string) => {
  return ((await loadSharedConfigFiles()).credentialsFile[
    profile
  ] as unknown) as any;
};

export const createShortCircuit = (parameters: {
  duration: number;
  error: Error;
}) => {
  let timeoutReference: NodeJS.Timeout;
  let launched = false;

  if (parameters.duration < 0) {
    throw new Error("Duration cannot be negative");
  }

  const launch = async (): Promise<never> => {
    launched = true;
    return new Promise((_, reject) => {
      timeoutReference = setTimeout(() => {
        reject(parameters.error);
      }, parameters.duration);
    });
  };

  const halt = () => {
    if (!launched || timeoutReference == undefined) {
      throw new Error("Cannot halt before launching");
    }
    clearTimeout(timeoutReference);
    launched = false;
  };

  return { launch, halt };
};
