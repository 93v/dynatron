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

export class Dynatron {
  constructor(private readonly params: DynatronConstructorParams) {}

  batchDelete = (keys: DocumentClient.Key[]) =>
    new BatchDeleter(this.params, keys);

  batchGet = (keys: DocumentClient.Key[]) => new BatchGetter(this.params, keys);

  batchPut = (items: DocumentClient.PutItemInputAttributeMap[]) =>
    new BatchPutter(this.params, items);

  check = (key: DocumentClient.Key) => new Checker(this.params, key);

  delete = (key: DocumentClient.Key) => new Deleter(this.params, key);

  get = (key: DocumentClient.Key) => new Getter(this.params, key);

  put = (item: DocumentClient.PutItemInputAttributeMap) =>
    new Putter(this.params, item);

  query = (key: DocumentClient.Key) => new Querier(this.params, key);

  scan = () => new Scanner(this.params);

  update = (key: DocumentClient.Key) => new Updater(this.params, key);

  transactGet = (items: Getter[]) => new TransactGetter(this.params, items);

  transactWrite = (items: (Checker | Putter | Deleter | Updater)[]) =>
    new TransactWriter(this.params, items);
}
