import AsyncRetry from "async-retry";

import {
  ScanCommand,
  ScanCommandInput,
  ScanInput,
  ScanOutput,
} from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

import { ListFetch } from "../_core/items-list-fetch";
import { NativeValue } from "../../dynatron";
import {
  BUILD,
  createShortCircuit,
  isRetryableError,
  LONG_MAX_LATENCY,
  RETRY_OPTIONS,
  TAKING_TOO_LONG_EXCEPTION,
} from "../../utils/misc-utils";
import { marshallRequestParameters } from "../../utils/request-marshaller";

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
        (requestInput.FilterExpression.match(/AND|OR/g) ?? []).length + 1;
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
        const input = {
          ...requestInput,
          ...(requestInput.Limit && {
            Limit:
              requestInput.Limit *
              FILTER_EXPRESSION_LIMIT_POWER_BASE ** filterExpressionComplexity,
          }),
        };
        try {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { $metadata, ...scanOutput } = await Promise.race([
            this.databaseClient.send(new ScanCommand(input)),
            shortCircuit.launch(),
          ]);
          if (scanOutput.LastEvaluatedKey == undefined || disableRecursion) {
            operationCompleted = true;
          } else {
            requestInput.ExclusiveStartKey = scanOutput.LastEvaluatedKey;
            keyAttributes = Object.keys(scanOutput.LastEvaluatedKey);
          }
          if (scanOutput.Items) {
            response.Items = [...(response.Items ?? []), ...scanOutput.Items];
          }
          if (scanOutput.Count) {
            response.Count = (response.Count ?? 0) + scanOutput.Count;
          }
          if (scanOutput.ScannedCount) {
            response.ScannedCount =
              (response.ScannedCount ?? 0) + scanOutput.ScannedCount;
          }
          if (scanOutput.ConsumedCapacity) {
            if (response.ConsumedCapacity) {
              response.ConsumedCapacity.CapacityUnits =
                (response.ConsumedCapacity.CapacityUnits ?? 0) +
                (scanOutput.ConsumedCapacity.CapacityUnits ?? 0);

              response.ConsumedCapacity.Table ??= { CapacityUnits: 0 };
              response.ConsumedCapacity.Table.CapacityUnits =
                (response.ConsumedCapacity.Table?.CapacityUnits ?? 0) +
                (scanOutput.ConsumedCapacity.Table?.CapacityUnits ?? 0);

              if (input.IndexName != undefined) {
                response.ConsumedCapacity.GlobalSecondaryIndexes ??= {
                  [input.IndexName]: { CapacityUnits: 0 },
                };
                response.ConsumedCapacity.GlobalSecondaryIndexes[
                  input.IndexName
                ].CapacityUnits =
                  (response.ConsumedCapacity.GlobalSecondaryIndexes[
                    input.IndexName
                  ].CapacityUnits ?? 0) +
                  (scanOutput.ConsumedCapacity.GlobalSecondaryIndexes?.[
                    input.IndexName
                  ].CapacityUnits ?? 0);
              }

              if (input.IndexName != undefined) {
                response.ConsumedCapacity.LocalSecondaryIndexes ??= {
                  [input.IndexName]: { CapacityUnits: 0 },
                };
                response.ConsumedCapacity.LocalSecondaryIndexes[
                  input.IndexName
                ].CapacityUnits =
                  (response.ConsumedCapacity.LocalSecondaryIndexes[
                    input.IndexName
                  ].CapacityUnits ?? 0) +
                  (scanOutput.ConsumedCapacity.LocalSecondaryIndexes?.[
                    input.IndexName
                  ].CapacityUnits ?? 0);
              }
            } else {
              response.ConsumedCapacity = scanOutput.ConsumedCapacity;
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
            for (const key of Object.keys(lastEvaluatedKey)) {
              if (!keyAttributes.includes(key)) {
                delete lastEvaluatedKey[key];
              }
            }
            response.LastEvaluatedKey =
              Object.keys(lastEvaluatedKey).length > 0
                ? lastEvaluatedKey
                : scanOutput.LastEvaluatedKey;
            operationCompleted = true;
          }
          if (disableRecursion && scanOutput.LastEvaluatedKey != undefined) {
            response.LastEvaluatedKey = scanOutput.LastEvaluatedKey;
          }
        } catch (error: unknown) {
          if (isRetryableError(error)) {
            throw error;
          }
          operationCompleted = true;
          (error as any).$input = input;
          bail(error as Error);
        } finally {
          shortCircuit.halt();
        }
      }

      return response;
    }, RETRY_OPTIONS);
  };

  /**
   * Execute the Scan request
   * @param disableRecursion boolean
   */
  $ = async <T = NativeValue[] | undefined>(
    disableRecursion = false,
  ): Promise<{ data: T | undefined } & Omit<ScanOutput, "Items">> => {
    const requestInput = marshallRequestParameters<ScanCommandInput>(
      this[BUILD](),
    );

    if (requestInput.IndexName) {
      delete requestInput.ConsistentRead;
    }

    let initialLimit: number | undefined;

    // When providing the start it is very easy to request for a start key out
    // of the specified segment. When the recursion is enabled, which is the
    // default behavior setting the start key will disable segments
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
        initialLimit = requestInput.Limit;
        requestInput.TotalSegments = Math.min(
          requestInput.Limit,
          requestInput.TotalSegments,
        );
        requestInput.Limit = Math.ceil(
          requestInput.Limit / requestInput.TotalSegments,
        );
      }
    }

    let outputs: ScanOutput[];
    if (requestInput.Segment == undefined) {
      outputs = await Promise.all(
        Array.from({ length: requestInput.TotalSegments ?? 1 }).map(
          async (_, segment) => {
            const segmentParameters = { ...requestInput };
            if (segmentParameters.TotalSegments) {
              segmentParameters.Segment = segment;
            }
            return this.scanSegment(segmentParameters, disableRecursion);
          },
        ),
      );
    } else {
      const segmentParameters = { ...requestInput };
      segmentParameters.TotalSegments ||= 1;
      if ((segmentParameters.Segment ?? 0) >= segmentParameters.TotalSegments) {
        throw new Error(
          `A segment with index ${
            segmentParameters.Segment
          } does not exist. The segment index can be between 0 and ${
            segmentParameters.TotalSegments - 1
          } for ${segmentParameters.TotalSegments} total segments.`,
        );
      }
      outputs = [await this.scanSegment(segmentParameters, disableRecursion)];
    }

    const aggregatedScanOutput: ScanOutput = {};

    for (const scanOutput of outputs) {
      aggregatedScanOutput.Items = [
        ...(aggregatedScanOutput.Items ?? []),
        ...(scanOutput.Items ?? []),
      ];

      aggregatedScanOutput.Count =
        (aggregatedScanOutput.Count ?? 0) + (scanOutput.Count ?? 0);

      aggregatedScanOutput.ScannedCount =
        (aggregatedScanOutput.ScannedCount ?? 0) +
        (scanOutput.ScannedCount ?? 0);

      aggregatedScanOutput.LastEvaluatedKey ??= scanOutput.LastEvaluatedKey;

      if (scanOutput.ConsumedCapacity) {
        if (aggregatedScanOutput.ConsumedCapacity) {
          aggregatedScanOutput.ConsumedCapacity.CapacityUnits =
            (aggregatedScanOutput.ConsumedCapacity.CapacityUnits ?? 0) +
            (scanOutput.ConsumedCapacity.CapacityUnits ?? 0);

          aggregatedScanOutput.ConsumedCapacity.Table ??= { CapacityUnits: 0 };
          aggregatedScanOutput.ConsumedCapacity.Table.CapacityUnits =
            (aggregatedScanOutput.ConsumedCapacity.Table?.CapacityUnits ?? 0) +
            (scanOutput.ConsumedCapacity.Table?.CapacityUnits ?? 0);

          if (requestInput.IndexName != undefined) {
            aggregatedScanOutput.ConsumedCapacity.GlobalSecondaryIndexes ??= {
              [requestInput.IndexName]: { CapacityUnits: 0 },
            };
            aggregatedScanOutput.ConsumedCapacity.GlobalSecondaryIndexes[
              requestInput.IndexName
            ].CapacityUnits =
              (aggregatedScanOutput.ConsumedCapacity.GlobalSecondaryIndexes[
                requestInput.IndexName
              ].CapacityUnits ?? 0) +
              (scanOutput.ConsumedCapacity.GlobalSecondaryIndexes?.[
                requestInput.IndexName
              ].CapacityUnits ?? 0);
          }

          if (requestInput.IndexName != undefined) {
            aggregatedScanOutput.ConsumedCapacity.LocalSecondaryIndexes ??= {
              [requestInput.IndexName]: { CapacityUnits: 0 },
            };
            aggregatedScanOutput.ConsumedCapacity.LocalSecondaryIndexes[
              requestInput.IndexName
            ].CapacityUnits =
              (aggregatedScanOutput.ConsumedCapacity.LocalSecondaryIndexes[
                requestInput.IndexName
              ].CapacityUnits ?? 0) +
              (scanOutput.ConsumedCapacity.LocalSecondaryIndexes?.[
                requestInput.IndexName
              ].CapacityUnits ?? 0);
          }
        } else {
          aggregatedScanOutput.ConsumedCapacity = scanOutput.ConsumedCapacity;
        }
      }
    }

    if (
      initialLimit &&
      (aggregatedScanOutput.Items?.length ?? 0) >= initialLimit
    ) {
      aggregatedScanOutput.Items = aggregatedScanOutput.Items?.slice(
        0,
        initialLimit,
      );
      aggregatedScanOutput.Count = aggregatedScanOutput.Items?.length ?? 0;
    }

    const { Items, LastEvaluatedKey, ...partialAggregatedScanOutput } =
      aggregatedScanOutput;

    return {
      ...partialAggregatedScanOutput,
      ...(LastEvaluatedKey
        ? { LastEvaluatedKey: unmarshall(LastEvaluatedKey) }
        : {}),
      data: Items?.map((item) => unmarshall(item)) as unknown as T,
    };
  };
}
