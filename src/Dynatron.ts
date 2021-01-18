import {
  CreateTableInput,
  DynamoDBClient,
  DynamoDBClientConfig,
  UpdateTableInput,
  UpdateTimeToLiveInput,
} from "@aws-sdk/client-dynamodb";
import { NativeAttributeValue } from "@aws-sdk/util-dynamodb";
import { NativeKey, NativeValue } from "../types/native-types";

import { Get } from "./requesters/items/1.1-get";
import { BatchGet } from "./requesters/1.2-batch-get";
import { Query } from "./requesters/items/1.3.1-query";
import { Scan } from "./requesters/items/1.3.2-scan";
import { Check } from "./requesters/items/2.1-check";
import { Delete } from "./requesters/items/2.1.1-delete";
import { Put } from "./requesters/items/2.1.2-put";
import { Update } from "./requesters/items/2.1.3-update";
import { BatchDelete } from "./requesters/2.2-batch-delete";
import { BatchPut } from "./requesters/2.3-batch-put";
import { TransactWrite } from "./requesters/2.4-transact-write";
import { TransactGet } from "./requesters/3-transact-get";
import { TableCreate } from "./requesters/tables/table-create";
import { TableDelete } from "./requesters/tables/table-delete";
import { TableDescribe } from "./requesters/tables/table-describe";
import { TableList } from "./requesters/tables/table-list";
import { TableTTLDescribe } from "./requesters/tables/table-ttl-describe";
import { TableTTLUpdate } from "./requesters/tables/table-ttl-update";
import { TableUpdate } from "./requesters/tables/table-update";
import { equals } from "./utils/condition-expression-utils";
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

  batchDelete = (keys: NativeKey[]) =>
    new BatchDelete(
      Dynatron.DynamoDBClients[this.instanceId],
      this.tableName,
      keys,
    );
  batchGet = (keys: NativeKey[]) =>
    new BatchGet(
      Dynatron.DynamoDBClients[this.instanceId],
      this.tableName,
      keys,
    );
  batchPut = (items: NativeValue[]) =>
    new BatchPut(
      Dynatron.DynamoDBClients[this.instanceId],
      this.tableName,
      items,
    );
  check = (key: NativeKey) =>
    new Check(Dynatron.DynamoDBClients[this.instanceId], this.tableName, key);
  delete = (key: NativeKey) =>
    new Delete(Dynatron.DynamoDBClients[this.instanceId], this.tableName, key);
  get = (key: NativeKey) =>
    new Get(Dynatron.DynamoDBClients[this.instanceId], this.tableName, key);
  put = (item: NativeValue) =>
    new Put(Dynatron.DynamoDBClients[this.instanceId], this.tableName, item);
  query = (attributePath: string, value: NativeAttributeValue) =>
    new Query(
      Dynatron.DynamoDBClients[this.instanceId],
      this.tableName,
      equals(attributePath, value),
    );
  scan = () =>
    new Scan(Dynatron.DynamoDBClients[this.instanceId], this.tableName);
  update = (key: NativeKey) =>
    new Update(Dynatron.DynamoDBClients[this.instanceId], this.tableName, key);
  transactGet = (items: Get[]) =>
    new TransactGet(
      Dynatron.DynamoDBClients[this.instanceId],
      this.tableName,
      items,
    );
  transactWrite = (items: (Check | Put | Delete | Update)[]) =>
    new TransactWrite(
      Dynatron.DynamoDBClients[this.instanceId],
      this.tableName,
      items,
    );

  public get Tables() {
    return {
      create: (input: CreateTableInput) =>
        new TableCreate(Dynatron.DynamoDBClients[this.instanceId], input),
      delete: () =>
        new TableDelete(
          Dynatron.DynamoDBClients[this.instanceId],
          this.tableName,
        ),
      describe: () =>
        new TableDescribe(
          Dynatron.DynamoDBClients[this.instanceId],
          this.tableName,
        ),
      describeTTL: () =>
        new TableTTLDescribe(
          Dynatron.DynamoDBClients[this.instanceId],
          this.tableName,
        ),
      list: () => new TableList(Dynatron.DynamoDBClients[this.instanceId]),
      update: (input: UpdateTableInput) =>
        new TableUpdate(Dynatron.DynamoDBClients[this.instanceId], input),
      updateTTL: (input: UpdateTimeToLiveInput) =>
        new TableTTLUpdate(Dynatron.DynamoDBClients[this.instanceId], input),
    };
  }
}
