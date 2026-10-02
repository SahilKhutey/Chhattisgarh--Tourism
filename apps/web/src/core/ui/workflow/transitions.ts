import type { WorkflowState, WorkflowAction } from "./types";

export function transitionWorkflowState<T>(
  current: WorkflowState<T>,
  action: WorkflowAction<T>,
): WorkflowState<T> {
  const now = Date.now();

  switch (action.type) {
    case "START":
      return {
        ...current,
        status: "loading",
        error: undefined,
        startedAt: now,
        completedAt: undefined,
      };

    case "SUCCEED":
      return {
        ...current,
        status: "success",
        data: action.data,
        error: undefined,
        completedAt: now,
      };

    case "SET_EMPTY":
      return {
        ...current,
        status: "empty",
        error: undefined,
        completedAt: now,
      };

    case "FAIL":
      return {
        ...current,
        status: "error",
        error: action.error,
        completedAt: now,
      };

    case "TIMEOUT":
      return {
        ...current,
        status: "timeout",
        error: action.error || {
          kind: "timeout",
          message: "The request took longer than expected.",
          retryable: true,
        },
        completedAt: now,
      };

    case "CANCEL":
      return {
        ...current,
        status: "cancelled",
        completedAt: now,
      };

    case "OFFLINE":
      return {
        ...current,
        status: "offline",
        error: action.error || {
          kind: "offline",
          message: "You appear to be offline.",
          retryable: true,
        },
        completedAt: now,
      };

    case "RETRY":
      return {
        ...current,
        status: "loading",
        error: undefined,
        startedAt: now,
        completedAt: undefined,
        retryCount: current.retryCount + 1,
      };

    case "RESET":
      return {
        status: "idle",
        data: undefined,
        error: undefined,
        startedAt: undefined,
        completedAt: undefined,
        retryCount: 0,
      };

    default:
      return current;
  }
}
