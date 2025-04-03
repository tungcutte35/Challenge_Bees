class ProcessingCancelledError extends Error {
  constructor() {
    super('Processing was cancelled');
  }
}
interface ProcessOptions {
  delayMs?: number;
  onProgress?: (processed: number, total: number) => void;
  shouldCancel?: () => boolean;
}

export const processWithDelay = async (
  numbers: number[],
  options: ProcessOptions = {}
): Promise<void> => {
  if (!Array.isArray(numbers) || !numbers.every((n) => typeof n === 'number')) {
    throw new Error('Invalid input: Expected an array of numbers.');
  }

  const { delayMs = 1000, onProgress, shouldCancel } = options;

  if (numbers.length === 0) return;

  for (const [index, num] of numbers.entries()) {
    if (shouldCancel?.()) {
      throw new ProcessingCancelledError();
    }

    console.log(num);
    onProgress?.(index + 1, numbers.length);

    await new Promise<void>((resolve, reject) => {
      const timeoutId = setTimeout(resolve, delayMs);

      const intervalId = setInterval(() => {
        if (shouldCancel?.()) {
          clearTimeout(timeoutId);
          clearInterval(intervalId);
          reject(new ProcessingCancelledError());
        }
      }, 100);
    });
  }
};
