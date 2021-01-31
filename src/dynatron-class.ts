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
import { TransactWrite } from "./requesters/items/2.3-transact-write";
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
      Dynatron.DynamoDBClients[this.instanceId] ??
      this.initializeDatabaseClient(this.clientConfiguration);
  }

  private initializeDatabaseClient = (
    connectionParameters?: DynamoDBClientConfig & { timeout?: number },
  ) => {
    const configuration: DynamoDBClientConfig = {
      ...connectionParameters,
      maxAttempts: 3,
    };

    if (configuration.region !== "local") {
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
        socketTimeout: connectionParameters?.timeout ?? LONG_MAX_LATENCY + 1000,
      });
    }

    return new DynamoDBClient(configuration);
  };

  /**
   * The operation deletes multiple items in the table.
   * @param keys NativeValue[]
   */
  batchDelete = (keys: NativeValue[]) =>
    new BatchWrite(
      Dynatron.DynamoDBClients[this.instanceId],
      this.tableName,
      keys,
    );
  /**
   * The operation returns the attributes of one or more items from one or more tables.
   * @param keys NativeValue[]
   */
  batchGet = (keys: NativeValue[]) =>
    new BatchGet(
      Dynatron.DynamoDBClients[this.instanceId],
      this.tableName,
      keys,
    );
  /**
   * The operation puts multiple items in the table.
   * @param items NativeValue[]
   */
  batchPut = (items: NativeValue[]) =>
    new BatchWrite(
      Dynatron.DynamoDBClients[this.instanceId],
      this.tableName,
      undefined,
      items,
    );
  check = (key: NativeValue) =>
    new Check(Dynatron.DynamoDBClients[this.instanceId], this.tableName, key);
  /**
   * Deletes a single item in a table by primary key.
   * @param key NativeValue
   */
  delete = (key: NativeValue) =>
    new Delete(Dynatron.DynamoDBClients[this.instanceId], this.tableName, key);
  /**
   * The operation returns a set of attributes for the item with the given primary key.
   * @param key NativeValue
   */
  get = (key: NativeValue) =>
    new Get(Dynatron.DynamoDBClients[this.instanceId], this.tableName, key);
  /**
   * Creates a new item, or replaces an old item with a new item.
   * @param item NativeValue
   */
  put = (item: NativeValue) =>
    new Put(Dynatron.DynamoDBClients[this.instanceId], this.tableName, item);
  /**
   * The operation finds items based on primary key values.
   * @param attributePath string
   * @param value NativeAttributeValue
   */
  query = (attributePath: string, value: NativeAttributeValue) =>
    new Query(
      Dynatron.DynamoDBClients[this.instanceId],
      this.tableName,
      equals(attributePath, value),
    );
  /**
   * The operation returns one or more items and item attributes by accessing every item in a table or a secondary index.
   */
  scan = () =>
    new Scan(Dynatron.DynamoDBClients[this.instanceId], this.tableName);
  /**
   * Edits an existing item's attributes, or adds a new item to the table if it does not already exist.
   * @param key NativeValue
   */
  update = (key: NativeValue) =>
    new Update(Dynatron.DynamoDBClients[this.instanceId], this.tableName, key);
  /**
   * This is a synchronous operation that atomically retrieves multiple items from one or more tables (but not from indexes) in a single account and Region.
   * @param items Get[]
   */
  transactGet = (items: Get[]) =>
    new TransactGet(
      Dynatron.DynamoDBClients[this.instanceId],
      this.tableName,
      items,
    );
  /**
   * This is a synchronous write operation that groups up to 25 action requests.
   * @param items (Check | Put | Delete | Update)[]
   */
  transactWrite = (items: (Check | Put | Delete | Update)[]) =>
    new TransactWrite(
      Dynatron.DynamoDBClients[this.instanceId],
      this.tableName,
      items,
    );

  /**
   * Switch to Table mode to work with the database tables
   */
  public get Tables() {
    return {
      /**
       * The operation adds a new table to your account.
       * @param input CreateTableInput
       */
      create: (input: CreateTableInput) =>
        new TableCreate(Dynatron.DynamoDBClients[this.instanceId], input),
      /**
       * The operation deletes a table and all of its items.
       */
      delete: () =>
        new TableDelete(
          Dynatron.DynamoDBClients[this.instanceId],
          this.tableName,
        ),
      /**
       * Returns information about the table, including the current status of the table, when it was created, the primary key schema, and any indexes on the table.
       */
      describe: () =>
        new TableDescribe(
          Dynatron.DynamoDBClients[this.instanceId],
          this.tableName,
        ),
      /**
       * Gives a description of the Time to Live (TTL) status on the specified table.
       */
      describeTTL: () =>
        new TableTTLDescribe(
          Dynatron.DynamoDBClients[this.instanceId],
          this.tableName,
        ),
      /**
       * Returns an array of table names associated with the current account and endpoint.
       */
      list: () => new TableList(Dynatron.DynamoDBClients[this.instanceId]),
      /**
       * Modifies the provisioned throughput settings, global secondary indexes, or DynamoDB Streams settings for a given table.
       * @param input UpdateTableInput
       */
      update: (input: UpdateTableInput) =>
        new TableUpdate(Dynatron.DynamoDBClients[this.instanceId], input),
      /**
       * The method enables or disables Time to Live (TTL) for the specified table.
       * @param input UpdateTimeToLiveInput
       */
      updateTTL: (input: UpdateTimeToLiveInput) =>
        new TableTTLUpdate(Dynatron.DynamoDBClients[this.instanceId], input),
    };
  }
}
