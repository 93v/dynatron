import { NodeHttpHandler } from "@aws-sdk/node-http-handler";
import { Agent } from "https";

import { LONG_MAX_LATENCY, MAX_SOCKETS } from "./utils/misc-utils";

export class OptimizedRequestHandler extends NodeHttpHandler {
  constructor(
    timeout?: number,
    maxSockets = MAX_SOCKETS,
    maxFreeSockets = MAX_SOCKETS,
  ) {
    super({
      httpsAgent: new Agent({
        keepAlive: true,
        rejectUnauthorized: true,
        maxSockets: maxSockets,
        maxFreeSockets: maxFreeSockets ?? maxFreeSockets / 8,
        secureProtocol: "TLSv1_method",
        ciphers: "ALL",
      }),
      socketTimeout: timeout ?? LONG_MAX_LATENCY + 1000,
    });
  }
}
