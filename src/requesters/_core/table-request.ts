export class TableRequest {
  protected patienceRatio = 1;

  /**
   * Modifies the requests timeouts latencies by the provided ratio.
   * @param patienceRatio number
   */
  relaxLatencies = (patienceRatio = 1) => {
    if (patienceRatio <= 0) {
      throw new Error("The ratio must be positive");
    }
    this.patienceRatio = patienceRatio;
    return this;
  };
}
