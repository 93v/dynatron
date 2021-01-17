// import {
//   CreateTableInput,
//   DynamoDBClient,
//   DynamoDBClientConfig,
//   UpdateTableInput,
//   UpdateTimeToLiveInput,
// } from "@aws-sdk/client-dynamodb";

// import { NativeKey } from "../types/key";
// import { BatchDeleter } from "./requesters/items/batch-deleter";
// import { BatchGetter } from "./requesters/items/batch-getter";
// import { BatchPutter } from "./requesters/items/batch-putter";
// import { Checker } from "./requesters/items/checker";
// import { Deleter } from "./requesters/items/deleter";
// import { Getter } from "./requesters/items/getter";
// import { Putter } from "./requesters/items/putter";
// import { Querier } from "./requesters/items/querier";
// import { Scanner } from "./requesters/items/scanner";
// import { TransactGetter } from "./requesters/items/transact-getter";
// import { TransactWriter } from "./requesters/items/transact-writer";
// import { Updater } from "./requesters/items/updater";
// import { TableCreator } from "./requesters/tables/table-creator";
// import { TableDeleter } from "./requesters/tables/table-deleter";
// import { TableDescriber } from "./requesters/tables/table-describer";
// import { TableLister } from "./requesters/tables/table-lister";
// import { TableTTLDescriber } from "./requesters/tables/table-ttl-describer";
// import { TableTTLUpdater } from "./requesters/tables/table-ttl-updater";
// import { TableUpdater } from "./requesters/tables/table-updater";
// import { initializeDatabaseClient } from "./utils/database-client";

// export class Dynatron {
//   protected static readonly DynamoDBClients = new Map<string, DynamoDBClient>();
//   constructor(
//     private readonly tableName: string,
//     private readonly clientConfiguration?: DynamoDBClientConfig,
//     private instanceId = "default",
//   ) {
//     Dynatron.DynamoDBClients.set(
//       this.instanceId,
//       Dynatron.DynamoDBClients.get(this.instanceId) ||
//         initializeDatabaseClient(this.clientConfiguration),
//     );
//   }

//   batchDelete = (keys: NativeKey[]) => new BatchDeleter(this, keys);
//   batchGet = () => new BatchGetter();
//   batchPut = () => new BatchPutter();
//   check = () => new Checker();
//   delete = () => new Deleter();
//   get = (key: Record<string, any>) =>
//     new Getter(
//       Dynatron.DynamoDBClients.get(this.instanceId) as DynamoDBClient,
//       this.tableName,
//       key,
//     );
//   put = () => new Putter();
//   query = () => new Querier();
//   scan = () => new Scanner();
//   update = () => new Updater();
//   transactGet = () => new TransactGetter();
//   transactWrite = () => new TransactWriter();

//   public get Tables() {
//     return {
//       create: (input: CreateTableInput) =>
//         new TableCreator(
//           Dynatron.DynamoDBClients.get(this.instanceId) as DynamoDBClient,
//           input,
//         ),
//       delete: () =>
//         new TableDeleter(
//           Dynatron.DynamoDBClients.get(this.instanceId) as DynamoDBClient,
//           this.tableName,
//         ),
//       describe: () =>
//         new TableDescriber(
//           Dynatron.DynamoDBClients.get(this.instanceId) as DynamoDBClient,
//           this.tableName,
//         ),
//       describeTTL: () =>
//         new TableTTLDescriber(
//           Dynatron.DynamoDBClients.get(this.instanceId) as DynamoDBClient,
//           this.tableName,
//         ),
//       list: () =>
//         new TableLister(
//           Dynatron.DynamoDBClients.get(this.instanceId) as DynamoDBClient,
//         ),
//       update: (input: UpdateTableInput) =>
//         new TableUpdater(
//           Dynatron.DynamoDBClients.get(this.instanceId) as DynamoDBClient,
//           input,
//         ),
//       updateTTL: (input: UpdateTimeToLiveInput) =>
//         new TableTTLUpdater(
//           Dynatron.DynamoDBClients.get(this.instanceId) as DynamoDBClient,
//           input,
//         ),
//     };
//   }
// }
