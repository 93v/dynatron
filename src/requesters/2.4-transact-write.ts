import { BUILD } from "../utils/constants";
import { Amend } from "./2-amend";

export class TransactWrite extends Amend {
  #ClientRequestToken?: string;

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
