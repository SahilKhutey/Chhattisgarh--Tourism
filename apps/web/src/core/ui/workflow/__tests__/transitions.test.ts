import { transitionWorkflowState } from "../transitions";
import { createInitialWorkflowState } from "../state";

describe("Workflow State Transitions", () => {
  it("transitions from idle to loading on START", () => {
    const initial = createInitialWorkflowState<string>();
    const next = transitionWorkflowState(initial, { type: "START" });

    expect(next.status).toBe("loading");
    expect(next.startedAt).toBeDefined();
    expect(next.error).toBeUndefined();
  });

  it("transitions to success on SUCCEED", () => {
    const initial = createInitialWorkflowState<string>();
    const loading = transitionWorkflowState(initial, { type: "START" });
    const success = transitionWorkflowState(loading, { type: "SUCCEED", data: "bastard-palace" });

    expect(success.status).toBe("success");
    expect(success.data).toBe("bastard-palace");
    expect(success.completedAt).toBeDefined();
  });

  it("transitions to empty on SET_EMPTY", () => {
    const initial = createInitialWorkflowState<string[]>();
    const empty = transitionWorkflowState(initial, { type: "SET_EMPTY" });

    expect(empty.status).toBe("empty");
    expect(empty.completedAt).toBeDefined();
  });

  it("transitions to error on FAIL", () => {
    const initial = createInitialWorkflowState();
    const errorState = transitionWorkflowState(initial, {
      type: "FAIL",
      error: { kind: "server", message: "Internal server error", retryable: true },
    });

    expect(errorState.status).toBe("error");
    expect(errorState.error?.kind).toBe("server");
    expect(errorState.completedAt).toBeDefined();
  });

  it("transitions to timeout with default or custom error on TIMEOUT", () => {
    const initial = createInitialWorkflowState();
    const timeoutState = transitionWorkflowState(initial, { type: "TIMEOUT" });

    expect(timeoutState.status).toBe("timeout");
    expect(timeoutState.error?.kind).toBe("timeout");
    expect(timeoutState.error?.retryable).toBe(true);
  });

  it("transitions to offline on OFFLINE", () => {
    const initial = createInitialWorkflowState();
    const offlineState = transitionWorkflowState(initial, { type: "OFFLINE" });

    expect(offlineState.status).toBe("offline");
    expect(offlineState.error?.kind).toBe("offline");
  });

  it("increments retryCount on RETRY", () => {
    const initial = createInitialWorkflowState();
    const retried1 = transitionWorkflowState(initial, { type: "RETRY" });
    expect(retried1.status).toBe("loading");
    expect(retried1.retryCount).toBe(1);

    const retried2 = transitionWorkflowState(retried1, { type: "RETRY" });
    expect(retried2.retryCount).toBe(2);
  });

  it("resets state completely on RESET", () => {
    const state = {
      status: "error" as const,
      data: "old",
      error: { kind: "server" as const, message: "err", retryable: true },
      startedAt: 100,
      completedAt: 200,
      retryCount: 3,
    };
    const reset = transitionWorkflowState(state, { type: "RESET" });

    expect(reset.status).toBe("idle");
    expect(reset.data).toBeUndefined();
    expect(reset.error).toBeUndefined();
    expect(reset.retryCount).toBe(0);
  });
});
