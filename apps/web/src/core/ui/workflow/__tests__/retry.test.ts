import {
  isMethodIdempotent,
  isSafeToAutoRetry,
  getRetryDelay,
  executeWithRetry,
  DEFAULT_RETRY_POLICY,
} from "../retry";

describe("Workflow Retry Policy", () => {
  it("recognizes idempotent methods as safe to auto-retry", () => {
    expect(isMethodIdempotent("GET")).toBe(true);
    expect(isMethodIdempotent("get")).toBe(true);
    expect(isMethodIdempotent("HEAD")).toBe(true);
    expect(isMethodIdempotent("OPTIONS")).toBe(true);
    expect(isMethodIdempotent(undefined)).toBe(true);

    expect(isMethodIdempotent("POST")).toBe(false);
    expect(isMethodIdempotent("PUT")).toBe(false);
    expect(isMethodIdempotent("DELETE")).toBe(false);
    expect(isMethodIdempotent("PATCH")).toBe(false);

    expect(isSafeToAutoRetry("GET")).toBe(true);
    expect(isSafeToAutoRetry("POST")).toBe(false);
  });

  it("calculates exponential backoff delay correctly", () => {
    const policy = { ...DEFAULT_RETRY_POLICY, jitter: false };
    expect(getRetryDelay(0, policy)).toBe(0);
    expect(getRetryDelay(1, policy)).toBe(500); // 500 * 2^0
    expect(getRetryDelay(2, policy)).toBe(1000); // 500 * 2^1
    expect(getRetryDelay(3, policy)).toBe(2000); // 500 * 2^2
    expect(getRetryDelay(4, policy)).toBe(4000); // capped at maxDelayMs 4000
  });

  it("adds jitter without exceeding maximum boundaries wildly", () => {
    const policy = { ...DEFAULT_RETRY_POLICY, jitter: true };
    const delay = getRetryDelay(2, policy);
    expect(delay).toBeGreaterThanOrEqual(700);
    expect(delay).toBeLessThanOrEqual(1400);
  });

  it("succeeds on first attempt if no error occurs", async () => {
    const op = jest.fn().mockResolvedValue("success");
    const result = await executeWithRetry(op);
    expect(result).toBe("success");
    expect(op).toHaveBeenCalledTimes(1);
  });

  it("retries on failure and succeeds eventually", async () => {
    const op = jest
      .fn()
      .mockRejectedValueOnce(new Error("fail 1"))
      .mockResolvedValueOnce("recovered");

    const result = await executeWithRetry(op, {
      maxAttempts: 3,
      baseDelayMs: 10,
      maxDelayMs: 50,
      jitter: false,
    });

    expect(result).toBe("recovered");
    expect(op).toHaveBeenCalledTimes(2);
  });

  it("throws last error if max attempts exhausted", async () => {
    const op = jest.fn().mockRejectedValue(new Error("persistent crash"));

    await expect(
      executeWithRetry(op, {
        maxAttempts: 2,
        baseDelayMs: 5,
        maxDelayMs: 10,
        jitter: false,
      }),
    ).rejects.toThrow("persistent crash");

    expect(op).toHaveBeenCalledTimes(2);
  });

  it("stops immediately if shouldRetry returns false", async () => {
    const op = jest.fn().mockRejectedValue(new Error("fatal 401"));

    await expect(
      executeWithRetry(
        op,
        { maxAttempts: 3, baseDelayMs: 5, jitter: false },
        () => false,
      ),
    ).rejects.toThrow("fatal 401");

    expect(op).toHaveBeenCalledTimes(1);
  });
});
