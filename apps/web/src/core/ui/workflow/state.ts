import type { WorkflowState, WorkflowStatus } from "./types";

export function createInitialWorkflowState<T>(initialData?: T): WorkflowState<T> {
  return {
    status: "idle",
    data: initialData,
    error: undefined,
    startedAt: undefined,
    completedAt: undefined,
    retryCount: 0,
  };
}

export function isWorkflowIdle(state: WorkflowState<unknown>): boolean {
  return state.status === "idle";
}

export function isWorkflowLoading(state: WorkflowState<unknown>): boolean {
  return state.status === "loading";
}

export function isWorkflowSuccess<T>(state: WorkflowState<T>): state is WorkflowState<T> & { data: T } {
  return state.status === "success";
}

export function isWorkflowEmpty(state: WorkflowState<unknown>): boolean {
  return state.status === "empty";
}

export function isWorkflowError(state: WorkflowState<unknown>): boolean {
  return state.status === "error";
}

export function isWorkflowTimeout(state: WorkflowState<unknown>): boolean {
  return state.status === "timeout";
}

export function isWorkflowOffline(state: WorkflowState<unknown>): boolean {
  return state.status === "offline";
}

export function isWorkflowCancelled(state: WorkflowState<unknown>): boolean {
  return state.status === "cancelled";
}

export function isWorkflowActive(state: WorkflowState<unknown>): boolean {
  return state.status === "loading";
}

export function isWorkflowTerminal(state: WorkflowState<unknown>): boolean {
  return (
    state.status === "success" ||
    state.status === "empty" ||
    state.status === "error" ||
    state.status === "timeout" ||
    state.status === "cancelled"
  );
}

export function isWorkflowRetryable(state: WorkflowState<unknown>): boolean {
  if (state.status === "error" || state.status === "timeout" || state.status === "offline") {
    return state.error?.retryable !== false;
  }
  return false;
}
