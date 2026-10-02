import { createSectionTracker } from "../visibility";

describe("Workflow Section Visibility & Tracker", () => {
  it("initializes with provided sections or defaults to idle", () => {
    const tracker = createSectionTracker({ weather: "loading", map: "idle" });
    expect(tracker.getStatus("weather")).toBe("loading");
    expect(tracker.getStatus("map")).toBe("idle");
    expect(tracker.getStatus("reviews")).toBe("idle");
  });

  it("updates and checks ready states (success or empty)", () => {
    const tracker = createSectionTracker();
    expect(tracker.isReady("overview")).toBe(false);

    tracker.setStatus("overview", "success");
    expect(tracker.isReady("overview")).toBe(true);

    tracker.setStatus("reviews", "empty");
    expect(tracker.isReady("reviews")).toBe(true);

    tracker.setStatus("gallery", "error");
    expect(tracker.isReady("gallery")).toBe(false);
  });

  it("detects error presence across any tracked section", () => {
    const tracker = createSectionTracker({
      hero: "success",
      itinerary: "success",
    });
    expect(tracker.hasErrors()).toBe(false);

    tracker.setStatus("weather", "timeout");
    expect(tracker.hasErrors()).toBe(true);
  });
});
