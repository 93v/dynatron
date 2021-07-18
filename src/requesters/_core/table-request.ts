export class TableRequest {
  protected patienceRatio = 1;

  /**
   * Modifies the requests timeouts latencies by the provided ratio.
   * @param patienceRatio number
   */
  relaxLatencies = (patienceRatio = 1) => {
    this.patienceRatio = patienceRatio <= 0 ? 1 : patienceRatio;
    return this;
  };
}
