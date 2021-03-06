import { Credentials } from "@aws-sdk/types";
import { Options } from "async-retry";
import { readFileSync } from "fs";
import { parse } from "ini";
import { homedir } from "os";
import path from "path";

import { NativeValue } from "../dynatron";

export const BUILD: unique symbol = Symbol("Build._build");

export const TAKING_TOO_LONG_EXCEPTION = "TakingTooLongException";

export const RETRY_OPTIONS: Options = { minTimeout: 50, retries: 5 };

const MILLISECONDS_IN_SECOND = 1000;
export const SHORT_MAX_LATENCY = MILLISECONDS_IN_SECOND;
export const LONG_MAX_LATENCY = 10 * MILLISECONDS_IN_SECOND;

export const assertNever = (object: never): never => {
  throw new Error(`Unexpected value: ${JSON.stringify(object)}`);
};

export const isRetryableError = (error: Error) =>
  error.message === TAKING_TOO_LONG_EXCEPTION ||
  (Object.prototype.hasOwnProperty.call(error, "retryable") &&
    (error as any).retryable) ||
  [
    "ECONN",
    "Internal Server Error",
    "InternalServerError",
    "NetworkingError",
    "Service Unavailable",
    "Throughput exceeds",
  ].some((message) =>
    error.toString().toUpperCase().includes(message.toUpperCase()),
  ) ||
  (Object.prototype.hasOwnProperty.call(error, "code") &&
    [
      "ItemCollectionSizeLimitExceededException",
      "LimitExceededException",
      "ProvisionedThroughputExceededException",
      "RequestLimitExceeded",
      "ResourceInUseException",
      "ThrottlingException",
      "UnrecognizedClientException",
    ].includes((error as any).code));

export const validateKey = (key: NativeValue) => {
  const keysLength = Object.keys(key).length;
  if (keysLength === 0) {
    throw new Error("At least 1 property must be present in the key");
  }
  if (keysLength > 2) {
    throw new Error(`At most 2 properties must be present in the key`);
  }
};

const getHomeDirectory = (): string => {
  const {
    HOME,
    USERPROFILE,
    HOMEPATH,
    HOMEDRIVE = `C:${path.sep}`,
  } = process.env;

  if (HOME) return HOME;
  if (USERPROFILE) return USERPROFILE;
  if (HOMEPATH) return `${HOMEDRIVE}${HOMEPATH}`;

  return homedir();
};

export const loadProfileCredentials = (
  profileName: string,
): Credentials | undefined => {
  const credentialsFile = readFileSync(
    path.join(getHomeDirectory(), ".aws", "credentials"),
    "utf-8",
  );

  const profile = parse(credentialsFile)[profileName];

  if (profile == undefined) {
    return;
  }

  return {
    accessKeyId: profile.aws_access_key_id ?? "",
    secretAccessKey: profile.aws_secret_access_key ?? "",
    ...(profile.aws_session_token && {
      sessionToken: profile.aws_session_token,
    }),
    ...(profile.aws_expiration && {
      expiration: new Date(profile.aws_expiration),
    }),
  };
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
      timeoutReference = global.setTimeout(() => {
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
