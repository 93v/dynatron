import retry from "async-retry";
import {
  ItemList,
  ScanInput,
  ScanOutput,
  ScanSegment,
  ScanTotalSegments,
} from "aws-sdk/clients/dynamodb";

import {
  BUILD,
  BUILD_PARAMS,
  LONG_MAX_LATENCY,
  RETRY_OPTIONS,
  TAKING_TOO_LONG_EXCEPTION,
} from "../utils/constants";
import { optimizeRequestParams } from "../utils/expression-optimization-utils";
import { isRetryableDBError, QuickFail } from "../utils/misc-utils";
import { MultiGetter } from "./_MultiGetter";

const MIN_TOTAL_SEGMENTS = 1;
const MAX_TOTAL_SEGMENTS = 1_000_000;

export class Scanner extends MultiGetter {
  readonly #INITIAL_MAX_TOTAL_SEGMENTS = 10;
  #TotalSegments?: ScanTotalSegments = this.#INITIAL_MAX_TOTAL_SEGMENTS;
  #Segment?: ScanSegment;

  totalSegments = (
    totalSegments: ScanTotalSegments = this.#INITIAL_MAX_TOTAL_SEGMENTS,
  ) => {
    this.#TotalSegments = totalSegments;
    return this;
  };

  segment = (segment: ScanSegment) => {
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
      ...(this.#TotalSegments ? { TotalSegments: this.#TotalSegments } : {}),
      ...(this.#Segment ? { Segment: this.#Segment } : {}),
    };
  }

  private scanSegment = async (params: ScanInput) => {
    let operationCompleted = false;
    if (params.Segment != null && params.TotalSegments) {
      params.Segment = Math.min(
        Math.max(params.Segment, MIN_TOTAL_SEGMENTS - 1),
        params.TotalSegments - 1,
      );
    }
    const response: ScanOutput = {};
    return retry(async (bail, attempt) => {
      while (!operationCompleted) {
        const qf = new QuickFail(
          attempt * LONG_MAX_LATENCY,
          new Error(TAKING_TOO_LONG_EXCEPTION),
        );
        try {
          const result = await Promise.race([
            this.DB.scan(params).promise(),
            qf.wait(),
          ]);
          if (result.LastEvaluatedKey == null) {
            operationCompleted = true;
          } else {
            params.ExclusiveStartKey = result.LastEvaluatedKey;
          }
          if (result.Items) {
            response.Items = [...(response.Items || []), ...result.Items];
          }
          if (result.Count) {
            response.Count = (response.Count || 0) + result.Count;
          }
          if (result.ScannedCount) {
            response.ScannedCount =
              (response.ScannedCount || 0) + result.ScannedCount;
          }
          if (result.ConsumedCapacity) {
            if (!response.ConsumedCapacity) {
              response.ConsumedCapacity = result.ConsumedCapacity;
            } else {
              response.ConsumedCapacity.CapacityUnits =
                (response.ConsumedCapacity.CapacityUnits || 0) +
                (result.ConsumedCapacity?.CapacityUnits || 0);
            }
          }
          if (params.Limit && (response.Items?.length || 0) >= params.Limit) {
            response.Items = response.Items?.slice(0, params.Limit);
            response.Count = response.Items?.length || 0;
            operationCompleted = true;
          }
        } catch (ex) {
          if (!isRetryableDBError(ex)) {
            bail(ex);
            return;
          }
          throw ex;
        } finally {
          qf.cancel();
        }
      }
      return response;
    }, RETRY_OPTIONS);
  };

  [BUILD_PARAMS]() {
    const requestParams = super[BUILD_PARAMS]();

    return {
      TableName: this.table,
      ...optimizeRequestParams(requestParams),
    };
  }

  $execute = async <T = ItemList | undefined | null, U extends boolean = false>(
    returnRawResponse?: U,
  ): Promise<U extends true ? ScanOutput : T | undefined | null> => {
    const params = { ...(this[BUILD_PARAMS]() as ScanInput) };
    if (params.IndexName) {
      delete params.ConsistentRead;
    }
    let initialLimit: number | undefined;
    if (params.ExclusiveStartKey) {
      delete params.TotalSegments;
      delete params.Segment;
    }
    if (params.TotalSegments) {
      params.TotalSegments = Math.max(
        Math.min(params.TotalSegments, MAX_TOTAL_SEGMENTS),
        MIN_TOTAL_SEGMENTS,
      );
      if (params.Limit) {
        const totalSegmentsBasedOnLimit = Math.ceil(params.Limit * 0.2);
        params.TotalSegments = Math.min(
          params.TotalSegments,
          totalSegmentsBasedOnLimit,
        );
        initialLimit = params.Limit;
        params.Limit = Math.ceil(params.Limit / params.TotalSegments);
      }
    }
    let responses: (ScanOutput | undefined)[] = [];
    if (params.Segment != null) {
      const segmentParams = { ...params };
      if (!segmentParams.TotalSegments) {
        segmentParams.TotalSegments = 1;
      }
      responses = [await this.scanSegment(params)];
    } else {
      responses = await Promise.all(
        [...Array(params.TotalSegments || 1).keys()].map(async (segment) => {
          const segmentParams = { ...params };
          if (segmentParams.TotalSegments) {
            segmentParams.Segment = segment;
          }
          return this.scanSegment(segmentParams);
        }),
      );
    }
    const consolidatedResponse = responses.reduce((p: ScanOutput, c) => {
      const o: ScanOutput = {
        Items: [...(p.Items || []), ...(c?.Items || [])],
        Count: (p.Count || 0) + (c?.Count || 0),
        ScannedCount: (p.ScannedCount || 0) + (c?.ScannedCount || 0),
      };
      if (c?.ConsumedCapacity) {
        if (!p.ConsumedCapacity) {
          o.ConsumedCapacity = c.ConsumedCapacity;
        } else {
          o.ConsumedCapacity = o.ConsumedCapacity || {};
          o.ConsumedCapacity.CapacityUnits =
            (p.ConsumedCapacity.CapacityUnits || 0) +
            (c.ConsumedCapacity?.CapacityUnits || 0);
        }
      }
      return o;
    }, {});
    if (
      initialLimit &&
      (consolidatedResponse.Items?.length || 0) >= initialLimit
    ) {
      consolidatedResponse.Items = consolidatedResponse.Items?.slice(
        0,
        initialLimit,
      );
      consolidatedResponse.Count = consolidatedResponse.Items?.length || 0;
    }
    return (returnRawResponse
      ? consolidatedResponse
      : consolidatedResponse.Items) as any;
  };

  $ = this.$execute;
}
