import {
  CreateTableInput,
  DynamoDBClient,
  DynamoDBClientConfig,
  UpdateTableInput,
  UpdateTimeToLiveInput,
} from "@aws-sdk/client-dynamodb";
import { NativeKey } from "../types/key";

import { Getter } from "./requesters/1.1-getter";
import { BatchGetter } from "./requesters/1.2-batch-getter";
import { Querier } from "./requesters/1.3.1-querier";
import { Scanner } from "./requesters/1.3.2-scanner";
import { ConditionChecker } from "./requesters/2.1-condition-checker";
import { Deleter } from "./requesters/2.1.1-deleter";
import { Putter } from "./requesters/2.1.2-putter";
import { Updater } from "./requesters/2.1.3-updater";
import { BatchDeleter } from "./requesters/2.2-batch-deleter";
import { BatchPutter } from "./requesters/2.3-batch-putter";
import { TransactWriter } from "./requesters/2.4-transact-writer";
import { TransactGetter } from "./requesters/3-transact-getter";
import { TableCreator } from "./requesters/tables/table-creator";
import { TableDeleter } from "./requesters/tables/table-deleter";
import { TableDescriber } from "./requesters/tables/table-describer";
import { TableLister } from "./requesters/tables/table-lister";
import { TableTTLDescriber } from "./requesters/tables/table-ttl-describer";
import { TableTTLUpdater } from "./requesters/tables/table-ttl-updater";
import { TableUpdater } from "./requesters/tables/table-updater";
import { initializeDatabaseClient } from "./utils/database-client";

export class Dynatron {
  protected static readonly DynamoDBClients: Record<
    string,
    DynamoDBClient
  > = {};
  constructor(
    private readonly tableName: string,
    private readonly clientConfiguration?: DynamoDBClientConfig,
    private instanceId = "default",
  ) {
    Dynatron.DynamoDBClients[this.instanceId] =
      Dynatron.DynamoDBClients[this.instanceId] ||
      initializeDatabaseClient(this.clientConfiguration);
  }

  batchDelete = () =>
    new BatchDeleter(Dynatron.DynamoDBClients[this.instanceId], this.tableName);
  batchGet = () =>
    new BatchGetter(Dynatron.DynamoDBClients[this.instanceId], this.tableName);
  batchPut = () =>
    new BatchPutter(Dynatron.DynamoDBClients[this.instanceId], this.tableName);
  check = () =>
    new ConditionChecker(
      Dynatron.DynamoDBClients[this.instanceId],
      this.tableName,
    );
  delete = () =>
    new Deleter(Dynatron.DynamoDBClients[this.instanceId], this.tableName);
  get = (key: NativeKey) =>
    new Getter(Dynatron.DynamoDBClients[this.instanceId], this.tableName, key);
  put = () =>
    new Putter(Dynatron.DynamoDBClients[this.instanceId], this.tableName);
  query = () =>
    new Querier(Dynatron.DynamoDBClients[this.instanceId], this.tableName);
  scan = () =>
    new Scanner(Dynatron.DynamoDBClients[this.instanceId], this.tableName);
  update = () =>
    new Updater(Dynatron.DynamoDBClients[this.instanceId], this.tableName);
  transactGet = () =>
    new TransactGetter(
      Dynatron.DynamoDBClients[this.instanceId],
      this.tableName,
    );
  transactWrite = () =>
    new TransactWriter(
      Dynatron.DynamoDBClients[this.instanceId],
      this.tableName,
    );

  public get Tables() {
    return {
      create: (input: CreateTableInput) =>
        new TableCreator(Dynatron.DynamoDBClients[this.instanceId], input),
      delete: () =>
        new TableDeleter(
          Dynatron.DynamoDBClients[this.instanceId],
          this.tableName,
        ),
      describe: () =>
        new TableDescriber(
          Dynatron.DynamoDBClients[this.instanceId],
          this.tableName,
        ),
      describeTTL: () =>
        new TableTTLDescriber(
          Dynatron.DynamoDBClients[this.instanceId],
          this.tableName,
        ),
      list: () => new TableLister(Dynatron.DynamoDBClients[this.instanceId]),
      update: (input: UpdateTableInput) =>
        new TableUpdater(Dynatron.DynamoDBClients[this.instanceId], input),
      updateTTL: (input: UpdateTimeToLiveInput) =>
        new TableTTLUpdater(Dynatron.DynamoDBClients[this.instanceId], input),
    };
  }
}
