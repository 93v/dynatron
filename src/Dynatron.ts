import DynamoDB, {
  CreateTableInput,
  DocumentClient,
  UpdateTableInput,
  UpdateTimeToLiveInput,
} from "aws-sdk/clients/dynamodb";

import { DynatronConstructorParams } from "../types/request";
import { BatchDeleter } from "./requesters/BatchDeleter";
import { BatchGetter } from "./requesters/BatchGetter";
import { BatchPutter } from "./requesters/BatchPutter";
import { Checker } from "./requesters/Checker";
import { Deleter } from "./requesters/Deleter";
import { Getter } from "./requesters/Getter";
import { Putter } from "./requesters/Putter";
import { Querier } from "./requesters/Querier";
import { Scanner } from "./requesters/Scanner";
import { TableCreator } from "./requesters/tables/TableCreator";
import { TableDeleter } from "./requesters/tables/TableDeleter";
import { TableDescriber } from "./requesters/tables/TableDescriber";
import { TablesLister } from "./requesters/tables/TablesLister";
import { TableTTLDescriber } from "./requesters/tables/TableTTLDescriber";
import { TableTTLUpdater } from "./requesters/tables/TableTTLUpdater";
import { TableUpdater } from "./requesters/tables/TableUpdater";
import { TransactGetter } from "./requesters/TransactGetter";
import { TransactWriter } from "./requesters/TransactWriter";
import { Updater } from "./requesters/Updater";
import { initDB, initDocumentClient } from "./utils/misc-utils";

export class Dynatron {
  protected static readonly DynamoDBs: Record<string, DynamoDB> = {};
  protected static readonly DocumentClients: Record<
    string,
    DocumentClient
  > = {};

  constructor(
    private readonly params: DynatronConstructorParams,
    private instanceId = "default",
  ) {
    Dynatron.DynamoDBs[this.instanceId] =
      Dynatron.DynamoDBs[this.instanceId] || initDB(params.clientConfigs);
    Dynatron.DocumentClients[this.instanceId] =
      Dynatron.DocumentClients[this.instanceId] ||
      initDocumentClient(params.clientConfigs);
  }

  batchDelete = (keys: DocumentClient.Key[]) =>
    new BatchDeleter(
      Dynatron.DocumentClients[this.instanceId],
      this.params.table,
      keys,
    );

  batchGet = (keys: DocumentClient.Key[]) =>
    new BatchGetter(
      Dynatron.DocumentClients[this.instanceId],
      this.params.table,
      keys,
    );

  batchPut = (items: DocumentClient.PutItemInputAttributeMap[]) =>
    new BatchPutter(
      Dynatron.DocumentClients[this.instanceId],
      this.params.table,
      items,
    );

  check = (key: DocumentClient.Key) =>
    new Checker(
      Dynatron.DocumentClients[this.instanceId],
      this.params.table,
      key,
    );

  delete = (key: DocumentClient.Key) =>
    new Deleter(
      Dynatron.DocumentClients[this.instanceId],
      this.params.table,
      key,
    );

  get = (key: DocumentClient.Key) =>
    new Getter(
      Dynatron.DocumentClients[this.instanceId],
      this.params.table,
      key,
    );

  put = (item: DocumentClient.PutItemInputAttributeMap) =>
    new Putter(
      Dynatron.DocumentClients[this.instanceId],
      this.params.table,
      item,
    );

  query = (key: DocumentClient.Key) =>
    new Querier(
      Dynatron.DocumentClients[this.instanceId],
      this.params.table,
      key,
    );

  scan = () =>
    new Scanner(Dynatron.DocumentClients[this.instanceId], this.params.table);

  update = (key: DocumentClient.Key) =>
    new Updater(
      Dynatron.DocumentClients[this.instanceId],
      this.params.table,
      key,
    );

  transactGet = (items: Getter[]) =>
    new TransactGetter(
      Dynatron.DocumentClients[this.instanceId],
      this.params.table,
      items,
    );

  transactWrite = (items: (Checker | Putter | Deleter | Updater)[]) =>
    new TransactWriter(
      Dynatron.DocumentClients[this.instanceId],
      this.params.table,
      items,
    );

  public get Tables() {
    return {
      create: (params: CreateTableInput) =>
        new TableCreator(Dynatron.DynamoDBs[this.instanceId], params),
      delete: (table: string) =>
        new TableDeleter(Dynatron.DynamoDBs[this.instanceId], table),
      describe: (table: string) =>
        new TableDescriber(Dynatron.DynamoDBs[this.instanceId], table),
      describeTTL: (table: string) =>
        new TableTTLDescriber(Dynatron.DynamoDBs[this.instanceId], table),
      list: () => new TablesLister(Dynatron.DynamoDBs[this.instanceId]),
      update: (params: UpdateTableInput) =>
        new TableUpdater(Dynatron.DynamoDBs[this.instanceId], params),
      updateTTL: (params: UpdateTimeToLiveInput) =>
        new TableTTLUpdater(Dynatron.DynamoDBs[this.instanceId], params),
    };
  }
}
