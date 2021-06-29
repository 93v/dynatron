import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { NativeAttributeValue } from "@aws-sdk/util-dynamodb";

import { equals } from "./condition-expression-builders";
import { NativeValue } from "./dynatron";
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

export class Operation {
  constructor(
    private databaseClient: DynamoDBClient,
    private tableName: string,
  ) {}

  /**
   * The operation deletes multiple items in the table.
   * @param keys NativeValue[]
   */
  batchDelete = (keys: NativeValue[]) =>
    new BatchWrite(this.databaseClient, this.tableName, keys);
  /**
   * The operation returns the attributes of one or more items from one or more tables.
   * @param keys NativeValue[]
   */
  batchGet = (keys: NativeValue[]) =>
    new BatchGet(this.databaseClient, this.tableName, keys);
  /**
   * The operation puts multiple items in the table.
   * @param items NativeValue[]
   */
  batchPut = (items: NativeValue[]) =>
    new BatchWrite(this.databaseClient, this.tableName, undefined, items);
  check = (key: NativeValue) =>
    new Check(this.databaseClient, this.tableName, key);
  /**
   * Deletes a single item in a table by primary key.
   * @param key NativeValue
   */
  delete = (key: NativeValue) =>
    new Delete(this.databaseClient, this.tableName, key);
  /**
   * The operation returns a set of attributes for the item with the given primary key.
   * @param key NativeValue
   */
  get = (key: NativeValue) => new Get(this.databaseClient, this.tableName, key);
  /**
   * Creates a new item, or replaces an old item with a new item.
   * @param item NativeValue
   */
  put = (item: NativeValue) =>
    new Put(this.databaseClient, this.tableName, item);
  /**
   * The operation finds items based on primary key values.
   * @param attributePath string
   * @param value NativeAttributeValue
   */
  query = (attributePath: string, value: NativeAttributeValue) =>
    new Query(
      this.databaseClient,
      this.tableName,
      equals(attributePath, value),
    );
  /**
   * The operation returns one or more items and item attributes by accessing every item in a table or a secondary index.
   */
  scan = () => new Scan(this.databaseClient, this.tableName);
  /**
   * Edits an existing item's attributes, or adds a new item to the table if it does not already exist.
   * @param key NativeValue
   */
  update = (key: NativeValue) =>
    new Update(this.databaseClient, this.tableName, key);
  /**
   * This is a synchronous operation that atomically retrieves multiple items from one or more tables (but not from indexes) in a single account and Region.
   * @param items Get[]
   */
  transactGet = (items: Get[]) =>
    new TransactGet(this.databaseClient, this.tableName, items);
  /**
   * This is a synchronous write operation that groups up to 25 action requests.
   * @param items (Check | Put | Delete | Update)[]
   */
  transactWrite = (items: (Check | Put | Delete | Update)[]) =>
    new TransactWrite(this.databaseClient, this.tableName, items);
}
