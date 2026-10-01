import {
  configureUIEventSink,
  trackUIEvent,
} from "@/core/ui/telemetry/client";

describe("UI telemetry", () => {
  it("sends a timestamped event to the configured sink", async () => {
    const sink = jest.fn();

    configureUIEventSink(sink);

    await trackUIEvent({
      name: "page_view",
      route: "/",
    });

    expect(sink).toHaveBeenCalledTimes(1);

    const event = sink.mock.calls[0][0];

    expect(event.name).toBe("page_view");
    expect(event.route).toBe("/");
    expect(event.timestamp).toBeDefined();
  });

  it("gracefully handles unconfigured sink", async () => {
    configureUIEventSink(undefined);

    await expect(
      trackUIEvent({
        name: "page_view",
        route: "/",
      }),
    ).resolves.not.toThrow();
  });
});
