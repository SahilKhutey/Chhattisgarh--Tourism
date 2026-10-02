export const DEFAULT_TIMEOUT_MS = 15_000;
export const SEARCH_TIMEOUT_MS = 8_000;
export const MAP_GEO_TIMEOUT_MS = 10_000;
export const MUTATION_TIMEOUT_MS = 20_000;

export interface TimeoutOptions {
  timeoutMs?: number;
}

export function createTimeoutController(timeoutMs = DEFAULT_TIMEOUT_MS): {
  controller: AbortController;
  timeoutId: ReturnType<typeof setTimeout>;
  clear: () => void;
} {
  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort(new DOMException("The request timed out.", "AbortError"));
  }, timeoutMs);

  const clear = () => {
    clearTimeout(timeoutId);
  };

  return {
    controller,
    timeoutId,
    clear,
  };
}

export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  timeoutMessage = "Operation timed out",
): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new DOMException(timeoutMessage, "AbortError"));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    return result;
  } finally {
    clearTimeout(timer!);
  }
}
