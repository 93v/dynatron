import { NativeKey } from "../../types/native-types";

export const validateKey = (parameters: {
  key: NativeKey;
  singlePropertyKey?: boolean;
}) => {
  const keysLength = Object.keys(parameters.key).length;
  const maxKeys = parameters.singlePropertyKey ? 1 : 2;
  if (keysLength === 0) {
    throw new Error("At least 1 property must be present in the key");
  }
  if (keysLength > maxKeys) {
    throw new Error(
      `At most ${maxKeys} ${
        maxKeys === 1 ? "property" : "properties"
      } must be present in the key`,
    );
  }
};
