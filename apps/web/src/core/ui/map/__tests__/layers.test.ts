import { DEFAULT_MAP_LAYERS, SCALE_ZOOM_THRESHOLDS } from "../types";

describe("Map Layers and Threshold Contracts", () => {
  it("provides configured default map layers", () => {
    expect(DEFAULT_MAP_LAYERS.length).toBeGreaterThan(0);
    const destLayer = DEFAULT_MAP_LAYERS.find((l) => l.id === "tourism-destinations");
    expect(destLayer).toBeDefined();
    expect(destLayer?.enabled).toBe(true);
  });

  it("defines strictly ordered zoom scale thresholds", () => {
    expect(SCALE_ZOOM_THRESHOLDS.WORLD_STATE).toBeLessThan(SCALE_ZOOM_THRESHOLDS.DISTRICT);
    expect(SCALE_ZOOM_THRESHOLDS.DISTRICT).toBeLessThan(SCALE_ZOOM_THRESHOLDS.DESTINATION);
    expect(SCALE_ZOOM_THRESHOLDS.DESTINATION).toBeLessThan(SCALE_ZOOM_THRESHOLDS.EXPERIENCE);
    expect(SCALE_ZOOM_THRESHOLDS.EXPERIENCE).toBeLessThan(SCALE_ZOOM_THRESHOLDS.SERVICE);
    expect(SCALE_ZOOM_THRESHOLDS.SERVICE).toBeLessThan(SCALE_ZOOM_THRESHOLDS.DETAIL);
  });
});
