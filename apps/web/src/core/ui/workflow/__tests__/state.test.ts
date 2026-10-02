import {
  createInitialWorkflowState,
  isWorkflowIdle,
  isWorkflowLoading,
  isWorkflowSuccess,
  isWorkflowEmpty,
  isWorkflowError,
  isWorkflowTimeout,
  isWorkflowOffline,
  isWorkflowCancelled,
  isWorkflowActive,
  isWorkflowTerminal,
  isWorkflowRetryable,
} from "../state";
import type { WorkflowState } from "../types";

describe("Workflow State Model", () => {
  it("initializes to idle state with zero retries", () => {
    const state = createInitialWorkflowState<string>("initial");
    expect(state.status).toBe("idle");
    expect(state.data).toBe("initial");
    expect(state.retryCount).toBe(0);
    expect(state.error).toBeUndefined();
    expect(isWorkflowIdle(state)).toBe(true);
    expect(isWorkflowActive(state)).toBe(false);
    expect(isWorkflowTerminal(state)).toBe(false);
  });

  it("correctly identifies loading and active states", () => {
    const state: WorkflowState<number> = {
      status: "loading",
      retryCount: 0,
      startedAt: Date.now(),
    };
    expect(isWorkflowLoading(state)).toBe(true);
    expect(isWorkflowActive(state)).toBe(true);
    expect(isWorkflowTerminal(state)).toBe(false);
  });

  it("correctly identifies success states and types data", () => {
    const state: WorkflowState<{ id: string }> = {
      status: "success",
      data: { id: "chhattisgarh-bastard" },
      retryCount: 0,
    };
    expect(isWorkflowSuccess(state)).toBe(true);
    expect(isWorkflowTerminal(state)).toBe(true);
    if (isWorkflowSuccess(state)) {
      expect(state.data.id).toBe("chhattisgarh-bastard");
    }
  });

  it("correctly identifies empty states as terminal", () => {
    const state: WorkflowState<string[]> = {
      status: "empty",
      retryCount: 0,
    };
    expect(isWorkflowEmpty(state)).toBe(true);
    expect(isWorkflowTerminal(state)).toBe(true);
    expect(isWorkflowActive(state)).toBe(false);
  });

  it("correctly identifies error states and retryable conditions", () => {
    const retryableError: WorkflowState<unknown> = {
      status: "error",
      error: { kind: "network", message: "Network fail", retryable: true },
      retryCount: 1,
    };
    expect(isWorkflowError(retryableError)).toBe(true);
    expect(isWorkflowTerminal(retryableError)).toBe(true);
    expect(isWorkflowRetryable(retryableError)).toBe(true);

    const nonRetryableError: WorkflowState<unknown> = {
      status: "error",
      error: { kind: "unauthorized", message: "Forbidden", retryable: false },
      retryCount: 0,
    };
    expect(isWorkflowRetryable(nonRetryableError)).toBe(false);
  });

  it("correctly handles timeout, offline, and cancelled states", () => {
    const timeoutState: WorkflowState<unknown> = {
      status: "timeout",
      error: { kind: "timeout", message: "Timed out", retryable: true },
      retryCount: 0,
    };
    expect(isWorkflowTimeout(timeoutState)).toBe(true);
    expect(isWorkflowRetryable(timeoutState)).toBe(true);

    const offlineState: WorkflowState<unknown> = {
      status: "offline",
      error: { kind: "offline", message: "No internet", retryable: true },
      retryCount: 0,
    };
    expect(isWorkflowOffline(offlineState)).toBe(true);
    expect(isWorkflowRetryable(offlineState)).toBe(true);

    const cancelledState: WorkflowState<unknown> = {
      status: "cancelled",
      retryCount: 0,
    };
    expect(isWorkflowCancelled(cancelledState)).toBe(true);
    expect(isWorkflowTerminal(cancelledState)).toBe(true);
  });
});
