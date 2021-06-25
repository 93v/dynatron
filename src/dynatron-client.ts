import { DynamoDBClient, DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";
import { NodeHttpHandler } from "@aws-sdk/node-http-handler";

export class DynatronClient extends DynamoDBClient {
  constructor(
    clientConfiguration?: DynamoDBClientConfig,
    requestHandler?: NodeHttpHandler,
  ) {
    super({
      ...clientConfiguration,
      maxAttempts: 3,
      requestHandler:
        clientConfiguration?.region !== "local" ? requestHandler : undefined,
    });
  }
}
