import {
  ScanCommand,
  ScanCommandInput,
  ScanInput,
  ScanOutput,
} from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import AsyncRetry from "async-retry";

import { NativeValue } from "../../dynatron-class";
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

  /**
   * For a parallel Scan request, TotalSegments represents the total number of segments into which the Scan operation will be divided. The value of TotalSegments corresponds to the number of application workers that will perform the parallel scan. For example, if you want to use four application threads to scan a table or an index, specify a TotalSegments value of 4.
   *
   * The value for TotalSegments must be greater than or equal to 1, and less than or equal to 1000000. If you specify a TotalSegments value of 1, the Scan operation will be sequential rather than parallel.
   * @param totalSegments number
   */
  totalSegments = (
    totalSegments: number = this.#INITIAL_MAX_TOTAL_SEGMENTS,
  ) => {
    this.#TotalSegments = totalSegments;
    return this;
  };

  /**
   * For a parallel Scan request, Segment identifies an individual segment to be scanned by an application worker.
   *
   * Segment IDs are zero-based, so the first segment is always 0. For example, if you want to use four application threads to scan a table or an index, then the first thread specifies a Segment value of 0, the second thread specifies 1, and so on.
   *
   * The value of LastEvaluatedKey returned from a parallel Scan request must be used as ExclusiveStartKey with the same segment ID in a subsequent Scan operation.
   *
   * The value for Segment must be greater than or equal to 0, and less than the value provided for TotalSegments.
   * @param segment number
   */
  segment = (segment: number) => {
    this.#Segment = segment;
    return this;
  };

  /**
   * Deletes the TotalSegments property
   */
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
    disableRecursion: boolean,
  ) => {
    let operationCompleted = false;
    if (requestInput.Segment != undefined && requestInput.TotalSegments) {
      requestInput.Segment = Math.min(
        Math.max(requestInput.Segment, MIN_TOTAL_SEGMENTS - 1),
        requestInput.TotalSegments - 1,
      );
    }
    // When both the Limit and FilterExpressions are provided we calculate
    // how complex is the FilterExpression
    // Initial complexity is 0 which sets the limit to the provided value
    let filterExpressionComplexity = 0;
    if (requestInput.Limit && requestInput.FilterExpression) {
      filterExpressionComplexity =
        (requestInput.FilterExpression.match(/AND|OR/g) || []).length + 1;
    }
    // Then the complexity is used with the following base number to request
    // for more elements when the filter is more complex for a faster resolution
    const FILTER_EXPRESSION_LIMIT_POWER_BASE = 5;

    let keyAttributes: string[] = [];
    const response: ScanOutput = {};
    return AsyncRetry(async (bail, attempt) => {
      while (!operationCompleted) {
        const shortCircuit = createShortCircuit({
          duration: attempt * LONG_MAX_LATENCY * this.patienceRatio,
          error: new Error(TAKING_TOO_LONG_EXCEPTION),
        });
        try {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { $metadata, ...output } = await Promise.race([
            this.databaseClient.send(
              new ScanCommand({
                ...requestInput,
                ...(requestInput.Limit && {
                  Limit:
                    requestInput.Limit *
                    FILTER_EXPRESSION_LIMIT_POWER_BASE **
                      filterExpressionComplexity,
                }),
              }),
            ),
            shortCircuit.launch(),
          ]);
          if (output.LastEvaluatedKey == undefined || disableRecursion) {
            operationCompleted = true;
          } else {
            requestInput.ExclusiveStartKey = output.LastEvaluatedKey;
            keyAttributes = Object.keys(output.LastEvaluatedKey);
          }
          if (output.Items) {
            response.Items = [...(response.Items ?? []), ...output.Items];
          }
          if (output.Count) {
            response.Count = (response.Count ?? 0) + output.Count;
          }
          if (output.ScannedCount) {
            response.ScannedCount =
              (response.ScannedCount ?? 0) + output.ScannedCount;
          }
          if (output.ConsumedCapacity) {
            if (response.ConsumedCapacity) {
              response.ConsumedCapacity.CapacityUnits =
                (response.ConsumedCapacity.CapacityUnits ?? 0) +
                (output.ConsumedCapacity.CapacityUnits ?? 0);
            } else {
              response.ConsumedCapacity = output.ConsumedCapacity;
            }
          }
          if (
            requestInput.Limit &&
            response.Items != undefined &&
            response.Items.length >= requestInput.Limit
          ) {
            response.Items = response.Items.slice(0, requestInput.Limit);
            response.Count = response.Items.length;
            const lastEvaluatedKey = {
              ...response.Items[response.Items.length - 1],
            };
            Object.keys(lastEvaluatedKey).forEach((key) => {
              if (!keyAttributes.includes(key)) {
                delete lastEvaluatedKey[key];
              }
            });
            response.LastEvaluatedKey = lastEvaluatedKey;
            operationCompleted = true;
          }
          if (disableRecursion && output.LastEvaluatedKey != undefined) {
            response.LastEvaluatedKey = output.LastEvaluatedKey;
          }
        } catch (error) {
          if (isRetryableError(error)) {
            throw error;
          }
          operationCompleted = true;
          bail(error);
        } finally {
          shortCircuit.halt();
        }
      }
      return response;
    }, RETRY_OPTIONS);
  };

  /**
   * Execute the Scan request
   * @param returnRawResponse boolean
   * @param disableRecursion boolean
   */
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

    // When providing the start it is very easy to request for a start key out
    // of the specified segment. When the recursion is enabled which is the
    // default behavior setting the start key will disabled segments
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

    let outputs: ScanOutput[];
    if (requestInput.Segment != undefined) {
      const segmentParameters = { ...requestInput };
      segmentParameters.TotalSegments = segmentParameters.TotalSegments || 1;
      outputs = [await this.scanSegment(requestInput, disableRecursion)];
    } else {
      outputs = await Promise.all(
        [...Array.from({ length: requestInput.TotalSegments ?? 1 }).keys()].map(
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
    const aggregatedOutput = outputs.reduce((aggregated, currentOutput) => {
      const output: ScanOutput = {
        Items: [...(aggregated.Items ?? []), ...(currentOutput.Items ?? [])],
        Count: (aggregated.Count ?? 0) + (currentOutput.Count ?? 0),
        ScannedCount:
          (aggregated.ScannedCount ?? 0) + (currentOutput.ScannedCount ?? 0),
        ...(disableRecursion
          ? {
              LastEvaluatedKey:
                aggregated.LastEvaluatedKey ?? currentOutput.LastEvaluatedKey,
            }
          : {}),
      };
      if (currentOutput.ConsumedCapacity) {
        if (aggregated.ConsumedCapacity) {
          output.ConsumedCapacity = output.ConsumedCapacity ?? {};
          output.ConsumedCapacity.CapacityUnits =
            (aggregated.ConsumedCapacity.CapacityUnits ?? 0) +
            (currentOutput.ConsumedCapacity.CapacityUnits ?? 0);
        } else {
          output.ConsumedCapacity = currentOutput.ConsumedCapacity;
        }
      }
      return output;
    }, {});
    if (initialLimit && (aggregatedOutput.Items?.length ?? 0) >= initialLimit) {
      aggregatedOutput.Items = aggregatedOutput.Items?.slice(0, initialLimit);
      aggregatedOutput.Count = aggregatedOutput.Items?.length ?? 0;
    }
    return (returnRawResponse
      ? aggregatedOutput
      : aggregatedOutput.Items?.map((item) => unmarshall(item))) as any;
  };
}
