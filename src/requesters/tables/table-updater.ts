// import {
//   DynamoDBClient,
//   UpdateTableCommand,
//   UpdateTableInput,
// } from "@aws-sdk/client-dynamodb";
// import retry from "async-retry";

// import {
//   BUILD_REQUEST_INPUT,
//   LONG_MAX_LATENCY,
//   RETRY_OPTIONS,
//   TAKING_TOO_LONG_EXCEPTION,
// } from "../../utils/constants";
// import { isRetryableError } from "../../utils/misc-utils";
// import { createShortCircuit } from "../../utils/short-circuit";

// export class TableUpdater {
//   constructor(
//     protected readonly client: DynamoDBClient,
//     protected parameters: UpdateTableInput,
//   ) {}

//   [BUILD_REQUEST_INPUT](): UpdateTableInput {
//     return { ...this.parameters };
//   }

//   $execute = async () => {
//     const requestInput = this[BUILD_REQUEST_INPUT]();
//     return retry(async (bail, attempt) => {
//       const shortCircuit = createShortCircuit({
//         duration: attempt * LONG_MAX_LATENCY,
//         error: new Error(TAKING_TOO_LONG_EXCEPTION),
//       });
//       try {
//         const output = await Promise.race([
//           this.client.send(new UpdateTableCommand(requestInput)),
//           shortCircuit.launch(),
//         ]);
//         return output.TableDescription;
//       } catch (error) {
//         if (!isRetryableError(error)) {
//           bail(error);
//           return;
//         }
//         throw error;
//       } finally {
//         shortCircuit.halt();
//       }
//     }, RETRY_OPTIONS);
//   };

//   $ = this.$execute;
// }
