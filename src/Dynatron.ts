import { DocumentClient } from "aws-sdk/clients/dynamodb";

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
import { initDocumentClient } from "./utils/misc-utils";

export class Dynatron {
  protected static readonly DB: Record<string, DocumentClient> = {};

  constructor(
    private readonly params: DynatronConstructorParams,
    private instanceId = "default",
  ) {
    Dynatron.DB[this.instanceId] =
      Dynatron.DB[this.instanceId] || initDocumentClient(params.clientConfigs);
  }

  batchDelete = (keys: DocumentClient.Key[]) =>
    new BatchDeleter(Dynatron.DB[this.instanceId], this.params.table, keys);

  batchGet = (keys: DocumentClient.Key[]) =>
    new BatchGetter(Dynatron.DB[this.instanceId], this.params.table, keys);

  batchPut = (items: DocumentClient.PutItemInputAttributeMap[]) =>
    new BatchPutter(Dynatron.DB[this.instanceId], this.params.table, items);

  check = (key: DocumentClient.Key) =>
    new Checker(Dynatron.DB[this.instanceId], this.params.table, key);

  delete = (key: DocumentClient.Key) =>
    new Deleter(Dynatron.DB[this.instanceId], this.params.table, key);

  get = (key: DocumentClient.Key) =>
    new Getter(Dynatron.DB[this.instanceId], this.params.table, key);

  put = (item: DocumentClient.PutItemInputAttributeMap) =>
    new Putter(Dynatron.DB[this.instanceId], this.params.table, item);

  query = (key: DocumentClient.Key) =>
    new Querier(Dynatron.DB[this.instanceId], this.params.table, key);

  scan = () => new Scanner(Dynatron.DB[this.instanceId], this.params.table);

  update = (key: DocumentClient.Key) =>
    new Updater(Dynatron.DB[this.instanceId], this.params.table, key);

  transactGet = (items: Getter[]) =>
    new TransactGetter(Dynatron.DB[this.instanceId], this.params.table, items);

  transactWrite = (items: (Checker | Putter | Deleter | Updater)[]) =>
    new TransactWriter(Dynatron.DB[this.instanceId], this.params.table, items);
}
