import { createTimeoutController, withTimeout } from "../timeout";

describe("Workflow Timeout Management", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("aborts controller after specified timeout duration", () => {
    const { controller, clear } = createTimeoutController(2000);
    expect(controller.signal.aborted).toBe(false);

    jest.advanceTimersByTime(1999);
    expect(controller.signal.aborted).toBe(false);

    jest.advanceTimersByTime(2);
    expect(controller.signal.aborted).toBe(true);

    clear();
  });

  it("does not abort if cleared beforehand", () => {
    const { controller, clear } = createTimeoutController(2000);
    clear();

    jest.advanceTimersByTime(3000);
    expect(controller.signal.aborted).toBe(false);
  });

  it("resolves promise if completed before timeout", async () => {
    const fastPromise = Promise.resolve("quick_data");
    const result = await withTimeout(fastPromise, 5000);
    expect(result).toBe("quick_data");
  });

  it("rejects with AbortError if promise exceeds timeout", async () => {
    const slowPromise = new Promise((resolve) => {
      setTimeout(() => resolve("late"), 10000);
    });

    const timeoutPromise = withTimeout(slowPromise, 1000, "Geo timeout");

    jest.advanceTimersByTime(1001);

    await expect(timeoutPromise).rejects.toThrow("Geo timeout");
  });
});
