import { DynamoDBClient, DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";
import { NodeHttpHandler } from "@aws-sdk/node-http-handler";
import { Agent } from "https";

import { LONG_MAX_LATENCY } from "./constants";

export const initializeDatabaseClient = (
  connectionParameters?: DynamoDBClientConfig & { timeout?: number },
) => {
  const configuration: DynamoDBClientConfig = {
    ...connectionParameters,
    maxAttempts: 3,
  };

  // TODO: smarter check
  if (
    configuration.region !== "local" &&
    configuration.region !== "localhost"
  ) {
    // Experiments have shown that this is the optimal number for sockets
    const MAX_SOCKETS = 256;

    configuration.requestHandler = new NodeHttpHandler({
      httpsAgent: new Agent({
        keepAlive: true,
        rejectUnauthorized: true,
        maxSockets: MAX_SOCKETS,
        maxFreeSockets: MAX_SOCKETS / 8,
        secureProtocol: "TLSv1_method",
        ciphers: "ALL",
      }),
      socketTimeout: connectionParameters?.timeout || LONG_MAX_LATENCY + 1000,
    });
  }

  return new DynamoDBClient(configuration);
};
