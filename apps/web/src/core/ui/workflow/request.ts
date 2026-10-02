import type { WorkflowState, WorkflowError } from "./types";
import { transitionWorkflowState } from "./transitions";
import { classifyWorkflowError } from "./errors";
import { withTimeout, DEFAULT_TIMEOUT_MS } from "./timeout";
import { executeWithRetry, type RetryPolicy, isSafeToAutoRetry } from "./retry";

export interface ExecuteWorkflowOptions {
  timeoutMs?: number;
  retryPolicy?: Partial<RetryPolicy>;
  method?: string;
  requestId?: string;
  signal?: AbortSignal;
}

export async function executeWorkflow<T>(
  operation: (signal?: AbortSignal) => Promise<T>,
  options: ExecuteWorkflowOptions = {},
  onStateChange?: (state: WorkflowState<T>) => void,
): Promise<T> {
  const timeoutMs = options.timeoutMs || DEFAULT_TIMEOUT_MS;
  const isSafe = isSafeToAutoRetry(options.method);

  let state: WorkflowState<T> = {
    status: "loading",
    startedAt: Date.now(),
    retryCount: 0,
  };
  onStateChange?.(state);

  try {
    const data = await executeWithRetry(
      async (attempt) => {
        if (attempt > 1) {
          state = transitionWorkflowState(state, { type: "RETRY" });
          onStateChange?.(state);
        }

        const controller = new AbortController();
        if (options.signal) {
          options.signal.addEventListener("abort", () => controller.abort(options.signal?.reason));
        }

        return await withTimeout(
          operation(controller.signal),
          timeoutMs,
          "The operation timed out.",
        );
      },
      isSafe ? options.retryPolicy : { maxAttempts: 1 },
    );

    // Determine if data is empty (empty array or nullish)
    if (Array.isArray(data) && data.length === 0) {
      state = transitionWorkflowState(state, { type: "SET_EMPTY" });
    } else {
      state = transitionWorkflowState(state, { type: "SUCCEED", data });
    }
    onStateChange?.(state);
    return data;
  } catch (err) {
    const error: WorkflowError = classifyWorkflowError(err, undefined, options.requestId);

    if (error.kind === "timeout") {
      state = transitionWorkflowState(state, { type: "TIMEOUT", error });
    } else if (error.kind === "offline") {
      state = transitionWorkflowState(state, { type: "OFFLINE", error });
    } else {
      state = transitionWorkflowState(state, { type: "FAIL", error });
    }

    onStateChange?.(state);
    throw error;
  }
}
