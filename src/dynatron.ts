/* eslint-disable unicorn/prefer-module */
/* eslint-disable @typescript-eslint/no-var-requires */
import {
  CreateTableInput,
  DynamoDBClient,
  DynamoDBClientConfig,
  UpdateTableInput,
  UpdateTimeToLiveInput,
} from "@aws-sdk/client-dynamodb";
import { Credentials } from "@aws-sdk/types";
import { NativeAttributeValue } from "@aws-sdk/util-dynamodb";

import { equals } from "./condition-expression-builders";
import { Check } from "./requesters/_core/items-check";
import { BatchGet } from "./requesters/batch/batch-get";
import { BatchWrite } from "./requesters/batch/batch-write";
import { Delete } from "./requesters/items/items-delete";
import { Get } from "./requesters/items/items-get";
import { Put } from "./requesters/items/items-put";
import { Query } from "./requesters/items/items-query";
import { Scan } from "./requesters/items/items-scan";
import { Update } from "./requesters/items/items-update";
import { TableCreate } from "./requesters/tables/tables-create";
import { TableDelete } from "./requesters/tables/tables-delete";
import { TableDescribe } from "./requesters/tables/tables-describe";
import { TableList } from "./requesters/tables/tables-list";
import { TableTTLDescribe } from "./requesters/tables/tables-ttl-describe";
import { TableTTLUpdate } from "./requesters/tables/tables-ttl-update";
import { TableUpdate } from "./requesters/tables/tables-update";
import { TransactGet } from "./requesters/transact/transact-get";
import { TransactWrite } from "./requesters/transact/transact-write";

export type NativeValue = Record<string, NativeAttributeValue>;

export type DynatronClientConfig = DynamoDBClientConfig & {
  timeout?: number;
  maxSockets?: number;
};

export class DynatronClient extends DynamoDBClient {
  constructor(readonly configuration: DynatronClientConfig) {
    super(configuration);
  }
}

export class Dynatron {
  constructor(private readonly client: DynatronClient) {}

  /**
   * Switch to "Table" mode to work with standard table operations
   * @param tableName string
   */
  public Items(tableName: string) {
    return {
      check: (key: NativeValue) => new Check(this.client, tableName, key),
      /**
       * Deletes a single item in a table by primary key.
       * @param key NativeValue
       */
      delete: (key: NativeValue) => new Delete(this.client, tableName, key),
      /**
       * The operation returns a set of attributes for the item with the given primary key.
       * @param key NativeValue
       */
      get: (key: NativeValue) => new Get(this.client, tableName, key),
      /**
       * Creates a new item, or replaces an old item with a new item.
       * @param item NativeValue
       */
      put: (item: NativeValue) => new Put(this.client, tableName, item),
      /**
       * The operation finds items based on primary key values.
       * @param attributePath string
       * @param value NativeAttributeValue
       */
      query: (attributePath: string, value: NativeAttributeValue) =>
        new Query(this.client, tableName, equals(attributePath, value)),
      /**
       * The operation returns one or more items and item attributes by accessing every item in a table or a secondary index.
       */
      scan: () => new Scan(this.client, tableName),
      /**
       * Edits an existing item's attributes, or adds a new item to the table if it does not already exist.
       * @param key NativeValue
       */
      update: (key: NativeValue) => new Update(this.client, tableName, key),
    };
  }

  /**
   * Switch to "Batch" mode to work with the transactional operations
   */
  public get Batch() {
    return {
      /**
       * The operation returns the attributes of one or more items from one or more tables.
       * @param items Get[]
       */
      get: (items: Get[]) => new BatchGet(this.client, items),
      /**
       * The operation puts or deletes multiple items in the table.
       * This operation cannot update items, use "Items.update" instead
       * @param items (Put | Delete)[]
       */
      write: (items: (Put | Delete)[]) => new BatchWrite(this.client, items),
    };
  }

  /**
   * Switch to "Transact" mode to work with the transactional operations
   */
  public get Transact() {
    return {
      /**
       * This is a synchronous operation that atomically retrieves multiple items from one or more tables (but not from indexes) in a single account and Region.
       * @param items Get[]
       */
      get: (items: Get[]) => new TransactGet(this.client, items),
      /**
       * This is a synchronous write operation that groups up to 25 action requests.
       * @param items (Check | Put | Delete | Update)[]
       */
      write: (items: (Check | Put | Delete | Update)[]) =>
        new TransactWrite(this.client, items),
    };
  }

  /**
   * Switch to "Tables" mode to work with the database tables management
   */
  public get Tables() {
    return {
      /**
       * The operation adds a new table to your account.
       * @param input CreateTableInput
       */
      create: (input: CreateTableInput) => new TableCreate(this.client, input),
      /**
       * The operation deletes a table and all of its items.
       */
      delete: (tableName: string) => new TableDelete(this.client, tableName),
      /**
       * Returns information about the table, including the current status of the table, when it was created, the primary key schema, and any indexes on the table.
       */
      describe: (tableName: string) =>
        new TableDescribe(this.client, tableName),
      /**
       * Gives a description of the Time to Live (TTL) status on the specified table.
       */
      describeTTL: (tableName: string) =>
        new TableTTLDescribe(this.client, tableName),
      /**
       * Returns an array of table names associated with the current account and endpoint.
       */
      list: () => new TableList(this.client),
      /**
       * Modifies the provisioned throughput settings, global secondary indexes, or DynamoDB Streams settings for a given table.
       * @param input UpdateTableInput
       */
      update: (input: UpdateTableInput) => new TableUpdate(this.client, input),
      /**
       * The method enables or disables Time to Live (TTL) for the specified table.
       * @param input UpdateTimeToLiveInput
       */
      updateTTL: (input: UpdateTimeToLiveInput) =>
        new TableTTLUpdate(this.client, input),
    };
  }

  /**
   * Loads and returns Credentials from the special credentials file
   * @param profileName string
   * @returns Credential
   */
  static loadProfileCredentials(profileName: string): Credentials | undefined {
    if (typeof process !== "object") {
      return;
    }

    const path = require("path");

    /**
     * Returns the path of the home directory of the OS
     * @returns string
     */
    const homeDirectory = (): string => {
      if (typeof process !== "object") {
        return "";
      }

      const {
        HOME,
        USERPROFILE,
        HOMEPATH,
        HOMEDRIVE = `C:${path.sep}`,
      } = process.env;

      if (HOME) return HOME;
      if (USERPROFILE) return USERPROFILE;
      if (HOMEPATH) return `${HOMEDRIVE}${HOMEPATH}`;

      return require("os").homedir();
    };

    const { readFileSync } = require("fs");
    const credentialsFile = readFileSync(
      path.join(homeDirectory(), ".aws", "credentials"),
      "utf-8",
    );

    const profile = require("ini").parse(credentialsFile)[profileName];

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
  }
}
