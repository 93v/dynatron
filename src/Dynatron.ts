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
  protected readonly DB: DocumentClient;

  constructor(private readonly params: DynatronConstructorParams) {
    this.DB = initDocumentClient(params.clientConfigs);
  }

  batchDelete = (keys: DocumentClient.Key[]) =>
    new BatchDeleter(this.DB, this.params.table, keys);

  batchGet = (keys: DocumentClient.Key[]) =>
    new BatchGetter(this.DB, this.params.table, keys);

  batchPut = (items: DocumentClient.PutItemInputAttributeMap[]) =>
    new BatchPutter(this.DB, this.params.table, items);

  check = (key: DocumentClient.Key) =>
    new Checker(this.DB, this.params.table, key);

  delete = (key: DocumentClient.Key) =>
    new Deleter(this.DB, this.params.table, key);

  get = (key: DocumentClient.Key) =>
    new Getter(this.DB, this.params.table, key);

  put = (item: DocumentClient.PutItemInputAttributeMap) =>
    new Putter(this.DB, this.params.table, item);

  query = (key: DocumentClient.Key) =>
    new Querier(this.DB, this.params.table, key);

  scan = () => new Scanner(this.DB, this.params.table);

  update = (key: DocumentClient.Key) =>
    new Updater(this.DB, this.params.table, key);

  transactGet = (items: Getter[]) =>
    new TransactGetter(this.DB, this.params.table, items);

  transactWrite = (items: (Checker | Putter | Deleter | Updater)[]) =>
    new TransactWriter(this.DB, this.params.table, items);
}
