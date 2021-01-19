import {
  ScanCommand,
  ScanCommandInput,
  ScanInput,
  ScanOutput,
} from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import AsyncRetry from "async-retry";

import { NativeValue } from "../../../types/native-types";
import {
  BUILD,
  createShortCircuit,
  isRetryableError,
  LONG_MAX_LATENCY,
  RETRY_OPTIONS,
  TAKING_TOO_LONG_EXCEPTION,
} from "../../utils/misc-utils";
import { marshallRequestParameters } from "../../utils/request-marshaller";
import { ListFetch } from "./1.3-list-fetch";

const MIN_TOTAL_SEGMENTS = 1;
const MAX_TOTAL_SEGMENTS = 1_000_000;

export class Scan extends ListFetch {
  readonly #INITIAL_MAX_TOTAL_SEGMENTS = 10;
  #TotalSegments?: number = this.#INITIAL_MAX_TOTAL_SEGMENTS;
  #Segment?: number;

  totalSegments = (
    totalSegments: number = this.#INITIAL_MAX_TOTAL_SEGMENTS,
  ) => {
    this.#TotalSegments = totalSegments;
    return this;
  };

  segment = (segment: number) => {
    this.#Segment = segment;
    return this;
  };

  disableSegments = () => {
    this.#TotalSegments = undefined;
    return this;
  };

  [BUILD]() {
    return {
      ...super[BUILD](),
      ...(this.#TotalSegments && { TotalSegments: this.#TotalSegments }),
      ...(this.#Segment != undefined && { Segment: this.#Segment }),
    };
  }

  private scanSegment = async (
    requestInput: ScanInput,
    disableRecursion = false,
  ) => {
    let operationCompleted = false;
    if (requestInput.Segment != undefined && requestInput.TotalSegments) {
      requestInput.Segment = Math.min(
        Math.max(requestInput.Segment, MIN_TOTAL_SEGMENTS - 1),
        requestInput.TotalSegments - 1,
      );
    }
    const response: ScanOutput = {};
    return AsyncRetry(async (bail, attempt) => {
      while (!operationCompleted) {
        const shortCircuit = createShortCircuit({
          duration: attempt * LONG_MAX_LATENCY * (this.patienceRatio || 1),
          error: new Error(TAKING_TOO_LONG_EXCEPTION),
        });
        try {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { $metadata, ...output } = await Promise.race([
            this.databaseClient.send(new ScanCommand(requestInput)),
            shortCircuit.launch(),
          ]);
          if (output.LastEvaluatedKey == undefined || disableRecursion) {
            operationCompleted = true;
          } else {
            requestInput.ExclusiveStartKey = output.LastEvaluatedKey;
          }
          if (output.Items) {
            response.Items = [...(response.Items || []), ...output.Items];
          }
          if (output.Count) {
            response.Count = (response.Count || 0) + output.Count;
          }
          if (output.ScannedCount) {
            response.ScannedCount =
              (response.ScannedCount || 0) + output.ScannedCount;
          }
          if (output.ConsumedCapacity) {
            if (!response.ConsumedCapacity) {
              response.ConsumedCapacity = output.ConsumedCapacity;
            } else {
              response.ConsumedCapacity.CapacityUnits =
                (response.ConsumedCapacity.CapacityUnits || 0) +
                (output.ConsumedCapacity?.CapacityUnits || 0);
            }
          }
          if (
            requestInput.Limit &&
            (response.Items?.length || 0) >= requestInput.Limit
          ) {
            response.Items = response.Items?.slice(0, requestInput.Limit);
            response.Count = response.Items?.length || 0;
            operationCompleted = true;
          }
          if (disableRecursion && output.LastEvaluatedKey != undefined) {
            response.LastEvaluatedKey = output.LastEvaluatedKey;
          }
        } catch (error) {
          if (!isRetryableError(error)) {
            bail(error);
            return;
          }
          throw error;
        } finally {
          shortCircuit.halt();
        }
      }
      return response;
    }, RETRY_OPTIONS);
  };

  $ = async <T = NativeValue[] | undefined, U extends boolean = false>(
    returnRawResponse?: U,
    disableRecursion = false,
  ): Promise<U extends true ? ScanOutput : T | undefined> => {
    const requestInput = marshallRequestParameters<ScanCommandInput>(
      this[BUILD](),
    );

    if (requestInput.IndexName) {
      delete requestInput.ConsistentRead;
    }

    let initialLimit: number | undefined;

    if (requestInput.ExclusiveStartKey && !disableRecursion) {
      delete requestInput.TotalSegments;
      delete requestInput.Segment;
    }

    if (requestInput.TotalSegments) {
      requestInput.TotalSegments = Math.max(
        Math.min(requestInput.TotalSegments, MAX_TOTAL_SEGMENTS),
        MIN_TOTAL_SEGMENTS,
      );

      if (requestInput.Limit) {
        const totalSegmentsBasedOnLimit = Math.ceil(requestInput.Limit * 0.2);
        requestInput.TotalSegments = Math.min(
          requestInput.TotalSegments,
          totalSegmentsBasedOnLimit,
        );
        initialLimit = requestInput.Limit;
        requestInput.Limit = Math.ceil(
          requestInput.Limit / requestInput.TotalSegments,
        );
      }
    }

    let outputs: (ScanOutput | undefined)[] = [];
    if (requestInput.Segment != undefined) {
      const segmentParameters = { ...requestInput };
      if (!segmentParameters.TotalSegments) {
        segmentParameters.TotalSegments = 1;
      }
      outputs = [await this.scanSegment(requestInput, disableRecursion)];
    } else {
      outputs = await Promise.all(
        [...Array.from({ length: requestInput.TotalSegments || 1 }).keys()].map(
          async (segment) => {
            const segmentParameters = { ...requestInput };
            if (segmentParameters.TotalSegments) {
              segmentParameters.Segment = segment;
            }
            return this.scanSegment(segmentParameters, disableRecursion);
          },
        ),
      );
    }
    const aggregatedOutput = outputs.reduce(
      (aggregated: ScanOutput, currentOutput) => {
        const output: ScanOutput = {
          Items: [...(aggregated.Items || []), ...(currentOutput?.Items || [])],
          Count: (aggregated.Count || 0) + (currentOutput?.Count || 0),
          ScannedCount:
            (aggregated.ScannedCount || 0) + (currentOutput?.ScannedCount || 0),
          ...(disableRecursion
            ? {
                LastEvaluatedKey:
                  aggregated.LastEvaluatedKey ||
                  currentOutput?.LastEvaluatedKey,
              }
            : {}),
        };
        if (currentOutput?.ConsumedCapacity) {
          if (!aggregated.ConsumedCapacity) {
            output.ConsumedCapacity = currentOutput.ConsumedCapacity;
          } else {
            output.ConsumedCapacity = output.ConsumedCapacity || {};
            output.ConsumedCapacity.CapacityUnits =
              (aggregated.ConsumedCapacity.CapacityUnits || 0) +
              (currentOutput.ConsumedCapacity?.CapacityUnits || 0);
          }
        }
        return output;
      },
      {},
    );
    if (initialLimit && (aggregatedOutput.Items?.length || 0) >= initialLimit) {
      aggregatedOutput.Items = aggregatedOutput.Items?.slice(0, initialLimit);
      aggregatedOutput.Count = aggregatedOutput.Items?.length || 0;
    }
    return (returnRawResponse
      ? aggregatedOutput
      : aggregatedOutput.Items?.map((item) => unmarshall(item))) as any;
  };
}
