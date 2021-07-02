import {
  CreateTableInput,
  DynamoDBClient,
  UpdateTableInput,
  UpdateTimeToLiveInput,
} from "@aws-sdk/client-dynamodb";
import { NativeAttributeValue } from "@aws-sdk/util-dynamodb";

import { DynatronClient } from "./dynatron-client";
import { Operation } from "./operation";
import { TableCreate } from "./requesters/tables/table-create";
import { TableDelete } from "./requesters/tables/table-delete";
import { TableDescribe } from "./requesters/tables/table-describe";
import { TableList } from "./requesters/tables/table-list";
import { TableTTLDescribe } from "./requesters/tables/table-ttl-describe";
import { TableTTLUpdate } from "./requesters/tables/table-ttl-update";
import { TableUpdate } from "./requesters/tables/table-update";

export type NativeValue = Record<string, NativeAttributeValue>;

export class Dynatron {
  protected static readonly DynamoDBClients: Record<string, DynamoDBClient> =
    {};
  constructor(dynatronClient: DynatronClient, private instanceId = "default") {
    Dynatron.DynamoDBClients[this.instanceId] =
      Dynatron.DynamoDBClients[this.instanceId] ?? dynatronClient;
  }

  /**
   * Sets the table that operations will apply on.
   * @param table String
   */
  tableName = (tableName: string) => {
    return new Operation(Dynatron.DynamoDBClients[this.instanceId], tableName);
  };

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
      delete: (tableName: string) =>
        new TableDelete(Dynatron.DynamoDBClients[this.instanceId], tableName),
      /**
       * Returns information about the table, including the current status of the table, when it was created, the primary key schema, and any indexes on the table.
       */
      describe: (tableName: string) =>
        new TableDescribe(Dynatron.DynamoDBClients[this.instanceId], tableName),
      /**
       * Gives a description of the Time to Live (TTL) status on the specified table.
       */
      describeTTL: (tableName: string) =>
        new TableTTLDescribe(
          Dynatron.DynamoDBClients[this.instanceId],
          tableName,
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
