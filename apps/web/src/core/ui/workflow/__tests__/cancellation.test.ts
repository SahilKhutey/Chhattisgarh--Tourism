import { createRequestTracker } from "../cancellation";

describe("Workflow Cancellation & Request Tracker", () => {
  it("increments id and aborts previous signal on nextId", () => {
    const tracker = createRequestTracker();
    const id1 = tracker.nextId();
    const signal1 = tracker.getSignal();

    expect(id1).toBe(1);
    expect(tracker.isCurrent(id1)).toBe(true);
    expect(signal1.aborted).toBe(false);

    const id2 = tracker.nextId();
    expect(id2).toBe(2);
    expect(tracker.isCurrent(id1)).toBe(false);
    expect(tracker.isCurrent(id2)).toBe(true);
    expect(signal1.aborted).toBe(true);
  });

  it("aborts current controller when abortCurrent is invoked", () => {
    const tracker = createRequestTracker();
    tracker.nextId();
    const signal = tracker.getSignal();

    expect(signal.aborted).toBe(false);
    tracker.abortCurrent();
    expect(signal.aborted).toBe(true);
  });
});
