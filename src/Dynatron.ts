import DynamoDB, { DocumentClient } from "aws-sdk/clients/dynamodb";

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
      create: (table: string) => {
        console.log(`Creating table ${table}`);
      },
    };
  }
}
