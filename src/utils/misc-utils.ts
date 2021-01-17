import { AttributeValue } from "@aws-sdk/client-dynamodb";

// import { NativeKey } from "../../types/key";
import { TAKING_TOO_LONG_EXCEPTION } from "./constants";
import alpha from "./next-alpha-char-generator";

export const serializeExpressionValue = (value: AttributeValue) => ({
  name: `:${alpha.getNext()}`,
  value,
});

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
