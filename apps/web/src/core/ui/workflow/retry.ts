export interface RetryPolicy {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  jitter?: boolean;
}

export const DEFAULT_RETRY_POLICY: RetryPolicy = {
  maxAttempts: 3,
  baseDelayMs: 500,
  maxDelayMs: 4000,
  jitter: true,
};

export function isMethodIdempotent(method?: string): boolean {
  if (!method) return true;
  const upper = method.toUpperCase();
  return upper === "GET" || upper === "HEAD" || upper === "OPTIONS";
}

export function isSafeToAutoRetry(method?: string): boolean {
  return isMethodIdempotent(method);
}

export function getRetryDelay(
  attempt: number,
  policy: RetryPolicy = DEFAULT_RETRY_POLICY,
): number {
  if (attempt <= 0) return 0;

  const exponential = policy.baseDelayMs * 2 ** Math.max(0, attempt - 1);
  const capped = Math.min(exponential, policy.maxDelayMs);

  if (policy.jitter) {
    // Add 10-30% randomized jitter to avoid thundering herd problem
    const jitterFactor = 0.8 + Math.random() * 0.4;
    return Math.round(capped * jitterFactor);
  }

  return capped;
}

export async function executeWithRetry<T>(
  operation: (attempt: number) => Promise<T>,
  policy: Partial<RetryPolicy> = {},
  shouldRetry?: (error: unknown, attempt: number) => boolean,
): Promise<T> {
  const mergedPolicy: RetryPolicy = {
    ...DEFAULT_RETRY_POLICY,
    ...policy,
  };

  let lastError: unknown;

  for (let attempt = 1; attempt <= mergedPolicy.maxAttempts; attempt++) {
    try {
      return await operation(attempt);
    } catch (err) {
      lastError = err;

      if (attempt >= mergedPolicy.maxAttempts) {
        break;
      }

      if (shouldRetry && !shouldRetry(err, attempt)) {
        break;
      }

      const delay = getRetryDelay(attempt, mergedPolicy);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
