import { AWSError, Credentials, SharedIniFileCredentials } from "aws-sdk";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { ServiceConfigurationOptions } from "aws-sdk/lib/service";
import https from "https";
import { v4 } from "uuid";

import {
  DirectConnectionWithCredentials,
  DirectConnectionWithProfile,
  DynatronDocumentClientParams,
} from "../../types/request";
import { LONG_MAX_LATENCY, TAKING_TOO_LONG_EXCEPTION } from "./constants";

export const serializeExpressionValue = (
  value: DocumentClient.AttributeValue,
) => ({
  name: `:${v4().substring(0, 8)}`,
  value,
});

export const validateKey = (
  key: DocumentClient.Key,
  singlePropertyKey = false,
) => {
  if (Object.keys(key).length === 0) {
    throw new Error("At least 1 property must be present in the key");
  }
  const maxKeys = singlePropertyKey ? 1 : 2;
  if (Object.keys(key).length > maxKeys) {
    throw new Error(
      `At most ${maxKeys} ${
        maxKeys === 1 ? "property" : "properties"
      } must be present in the key`,
    );
  }
};

export const assertNever = (obj: never): never => {
  throw new Error(`Unexpected value: ${JSON.stringify(obj)}`);
};

export const isRetryableDBError = (error: Error) =>
  error.message === TAKING_TOO_LONG_EXCEPTION ||
  (Object.prototype.hasOwnProperty.call(error, "retryable") &&
    (error as AWSError).retryable) ||
  error.toString().toUpperCase().includes("ECONN") ||
  error.toString().toUpperCase().includes("NetworkingError") ||
  error.toString().toUpperCase().includes("InternalServerError") ||
  (Object.prototype.hasOwnProperty.call(error, "code") &&
    ["ProvisionedThroughputExceededException", "ThrottlingException"].includes(
      (error as AWSError).code,
    ));

export const setOfValues = (
  values:
    | string
    | number
    | DocumentClient.binaryType
    | (string | number | DocumentClient.binaryType)[],
) => new DocumentClient().createSet(Array.isArray(values) ? values : [values]);

export const initDocumentClient = (params?: DynatronDocumentClientParams) => {
  const options: DocumentClient.DocumentClientOptions &
    ServiceConfigurationOptions = {
    convertEmptyValues: true,
    maxRetries: 3,
  };

  if (params == null || params?.mode === "direct") {
    // Experiments have shown that this is the optimal number for sockets
    const MAX_SOCKETS = 256;

    const dynamoDBHttpsAgent = new https.Agent({
      keepAlive: true,
      rejectUnauthorized: true,
      maxSockets: MAX_SOCKETS,
      maxFreeSockets: MAX_SOCKETS / 8,
      secureProtocol: "TLSv1_method",
      ciphers: "ALL",
    });

    options.httpOptions = {
      agent: dynamoDBHttpsAgent,
      timeout: params?.timeout || LONG_MAX_LATENCY + 1000,
    };
  }

  if (params?.mode === "direct") {
    if ((params as DirectConnectionWithProfile).profile) {
      options.credentials = new SharedIniFileCredentials({
        profile: (params as DirectConnectionWithProfile).profile,
      });
    } else {
      options.credentials = new Credentials({
        accessKeyId: (params as DirectConnectionWithCredentials).accessKeyId,
        secretAccessKey: (params as DirectConnectionWithCredentials)
          .secretAccessKey,
      });
    }

    options.region = (params as DirectConnectionWithProfile).region;
  }

  if (params?.mode === "local") {
    options.endpoint = `http://${params?.host || "localhost"}:${
      params?.port || 8000
    }`;
    options.region = "localhost";
    options.credentials = params?.profile
      ? new SharedIniFileCredentials({
          profile: params?.profile,
        })
      : new Credentials({
          accessKeyId: params?.accessKeyId || "localAwsAccessKeyId",
          secretAccessKey: params?.secretAccessKey || "localAwsSecretAccessKey",
        });
  }

  return new DocumentClient(options);
};

const pause = async (duration: number) =>
  new Promise((r) => setTimeout(r, duration));

export const quickFail = async (duration: number, error: Error) => {
  await pause(duration);
  throw error;
};
