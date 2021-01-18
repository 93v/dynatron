import { DynamoDBClient, Put, Delete, Update } from "@aws-sdk/client-dynamodb";
import { BUILD } from "../utils/constants";
import { Amend } from "./items/2-amend";
import { Check } from "./items/2.1-check";

export class TransactWrite extends Amend {
  #ClientRequestToken?: string;

  constructor(
    databaseClient: DynamoDBClient,
    tableName: string,
    private items: (Check | Put | Delete | Update)[],
  ) {
    super(databaseClient, tableName);
    // eslint-disable-next-line no-console
    console.log(this.items);
  }

  clientRequestToken = (clientRequestToken: string) => {
    this.#ClientRequestToken = clientRequestToken;
    return this;
  };

  [BUILD]() {
    return {
      ...super[BUILD](),
      ...(this.#ClientRequestToken && {
        ClientRequestToken: this.#ClientRequestToken,
      }),
    };
  }
}
