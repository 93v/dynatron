import {
  CreateTableInput,
  DynamoDBClient,
  DynamoDBClientConfig,
  UpdateTableInput,
  UpdateTimeToLiveInput,
} from "@aws-sdk/client-dynamodb";
import { NodeHttpHandler } from "@aws-sdk/node-http-handler";
import { NativeAttributeValue } from "@aws-sdk/util-dynamodb";
import { Agent } from "https";

import { equals } from "./condition-expression-builders";
import { Get } from "./requesters/items/1.1-get";
import { BatchGet } from "./requesters/items/1.2-batch-get";
import { Query } from "./requesters/items/1.3.1-query";
import { Scan } from "./requesters/items/1.3.2-scan";
import { Check } from "./requesters/items/2.1-check";
import { Delete } from "./requesters/items/2.1.1-delete";
import { Put } from "./requesters/items/2.1.2-put";
import { Update } from "./requesters/items/2.1.3-update";
import { BatchWrite } from "./requesters/items/2.2-batch-write";
import { TransactWrite } from "./requesters/items/2.4-transact-write";
import { TransactGet } from "./requesters/items/3-transact-get";
import { TableCreate } from "./requesters/tables/table-create";
import { TableDelete } from "./requesters/tables/table-delete";
import { TableDescribe } from "./requesters/tables/table-describe";
import { TableList } from "./requesters/tables/table-list";
import { TableTTLDescribe } from "./requesters/tables/table-ttl-describe";
import { TableTTLUpdate } from "./requesters/tables/table-ttl-update";
import { TableUpdate } from "./requesters/tables/table-update";
import { LONG_MAX_LATENCY } from "./utils/misc-utils";

export type NativeValue = Record<string, NativeAttributeValue>;

export class Dynatron {
  protected static readonly DynamoDBClients: Record<
    string,
    DynamoDBClient
  > = {};
  constructor(
    private readonly tableName: string,
    private readonly clientConfiguration?: DynamoDBClientConfig & {
      timeout?: number;
    },
    private instanceId = "default",
  ) {
    Dynatron.DynamoDBClients[this.instanceId] =
      Dynatron.DynamoDBClients[this.instanceId] ||
      this.initializeDatabaseClient(this.clientConfiguration);
  }

  private initializeDatabaseClient = (
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

  batchDelete = (keys: NativeValue[]) =>
    new BatchWrite(
      Dynatron.DynamoDBClients[this.instanceId],
      this.tableName,
      keys,
    );
  batchGet = (keys: NativeValue[]) =>
    new BatchGet(
      Dynatron.DynamoDBClients[this.instanceId],
      this.tableName,
      keys,
    );
  batchPut = (items: NativeValue[]) =>
    new BatchWrite(
      Dynatron.DynamoDBClients[this.instanceId],
      this.tableName,
      undefined,
      items,
    );
  check = (key: NativeValue) =>
    new Check(Dynatron.DynamoDBClients[this.instanceId], this.tableName, key);
  delete = (key: NativeValue) =>
    new Delete(Dynatron.DynamoDBClients[this.instanceId], this.tableName, key);
  get = (key: NativeValue) =>
    new Get(Dynatron.DynamoDBClients[this.instanceId], this.tableName, key);
  put = (item: NativeValue) =>
    new Put(Dynatron.DynamoDBClients[this.instanceId], this.tableName, item);
  query = (attributePath: string, value: NativeAttributeValue) =>
    new Query(
      Dynatron.DynamoDBClients[this.instanceId],
      this.tableName,
      equals(attributePath, value),
    );
  scan = () =>
    new Scan(Dynatron.DynamoDBClients[this.instanceId], this.tableName);
  update = (key: NativeValue) =>
    new Update(Dynatron.DynamoDBClients[this.instanceId], this.tableName, key);
  transactGet = (items: Get[]) =>
    new TransactGet(
      Dynatron.DynamoDBClients[this.instanceId],
      this.tableName,
      items,
    );
  transactWrite = (items: (Check | Put | Delete | Update)[]) =>
    new TransactWrite(
      Dynatron.DynamoDBClients[this.instanceId],
      this.tableName,
      items,
    );

  public get Tables() {
    return {
      create: (input: CreateTableInput) =>
        new TableCreate(Dynatron.DynamoDBClients[this.instanceId], input),
      delete: () =>
        new TableDelete(
          Dynatron.DynamoDBClients[this.instanceId],
          this.tableName,
        ),
      describe: () =>
        new TableDescribe(
          Dynatron.DynamoDBClients[this.instanceId],
          this.tableName,
        ),
      describeTTL: () =>
        new TableTTLDescribe(
          Dynatron.DynamoDBClients[this.instanceId],
          this.tableName,
        ),
      list: () => new TableList(Dynatron.DynamoDBClients[this.instanceId]),
      update: (input: UpdateTableInput) =>
        new TableUpdate(Dynatron.DynamoDBClients[this.instanceId], input),
      updateTTL: (input: UpdateTimeToLiveInput) =>
        new TableTTLUpdate(Dynatron.DynamoDBClients[this.instanceId], input),
    };
  }
}
