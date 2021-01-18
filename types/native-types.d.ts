import { NativeAttributeValue } from "@aws-sdk/util-dynamodb";

// This type is based on the unmarshall function signature
export type NativeKey = Record<string, NativeAttributeValue>;
export type NativeValue = Record<string, NativeAttributeValue>;
