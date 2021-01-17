export const createShortCircuit = (parameters: {
  duration: number;
  error: Error;
}) => {
  let timeoutReference: NodeJS.Timeout;
  let launched = false;

  if (parameters.duration < 0) {
    throw new Error("Duration cannot be negative");
  }

  const launch = async (): Promise<never> => {
    launched = true;
    return new Promise((_, reject) => {
      timeoutReference = setTimeout(() => {
        reject(parameters.error);
      }, parameters.duration);
    });
  };

  const halt = () => {
    if (!launched || timeoutReference == undefined) {
      throw new Error("Cannot halt before launching");
    }
    clearTimeout(timeoutReference);
    launched = false;
  };

  return { launch, halt };
};
