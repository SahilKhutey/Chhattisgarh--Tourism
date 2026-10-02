import { classifyWorkflowError } from "../errors";

describe("Workflow Error Classification", () => {
  it("classifies AbortError and timeouts as timeout kind", () => {
    const abortErr = new DOMException("The request was aborted.", "AbortError");
    const res1 = classifyWorkflowError(abortErr);
    expect(res1.kind).toBe("timeout");
    expect(res1.retryable).toBe(true);

    const timeoutErr = new Error("Gateway timeout occurred");
    const res2 = classifyWorkflowError(timeoutErr);
    expect(res2.kind).toBe("timeout");
  });

  it("classifies HTTP status codes accurately", () => {
    const err401 = classifyWorkflowError(new Error("Auth"), 401);
    expect(err401.kind).toBe("unauthorized");
    expect(err401.retryable).toBe(false);

    const err403 = classifyWorkflowError(new Error("Access"), 403);
    expect(err403.kind).toBe("forbidden");
    expect(err403.retryable).toBe(false);

    const err404 = classifyWorkflowError(new Error("Missing"), 404);
    expect(err404.kind).toBe("not_found");
    expect(err404.retryable).toBe(false);

    const err422 = classifyWorkflowError(new Error("Validation"), 422);
    expect(err422.kind).toBe("validation");
    expect(err422.retryable).toBe(false);

    const err429 = classifyWorkflowError(new Error("Too many"), 429);
    expect(err429.kind).toBe("rate_limit");
    expect(err429.retryable).toBe(true);

    const err500 = classifyWorkflowError(new Error("Crash"), 500, "req-123");
    expect(err500.kind).toBe("server");
    expect(err500.retryable).toBe(true);
    expect(err500.requestId).toBe("req-123");
  });

  it("classifies TypeError network failures as network kind", () => {
    const typeErr = new TypeError("Failed to fetch");
    const res = classifyWorkflowError(typeErr);
    expect(res.kind).toBe("network");
    expect(res.retryable).toBe(true);
  });

  it("classifies unknown errors gracefully", () => {
    const unknownErr = { message: "weird object" };
    const res = classifyWorkflowError(unknownErr);
    expect(res.kind).toBe("unknown");
    expect(res.retryable).toBe(true);
  });
});
