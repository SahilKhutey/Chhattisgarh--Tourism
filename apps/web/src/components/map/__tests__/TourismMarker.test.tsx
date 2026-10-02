import { createTourismIcon } from "../Markers/MarkerIcon";

describe("TourismMarker Icon Generator", () => {
  it("creates custom DivIcon for destinations with diamond shape and accessibility aria-label", () => {
    const icon = createTourismIcon({
      type: "place",
      label: "Chitrakote Falls",
      isSelected: false,
    });

    expect(icon).toBeDefined();
    expect(icon.options.className).toContain("cg-tourism-marker-icon");
    expect(icon.options.html).toContain('aria-label="Chitrakote Falls, place"');
    expect(icon.options.html).toContain("polygon");
  });

  it("applies selection animation and halo classes when isSelected is true", () => {
    const icon = createTourismIcon({
      type: "place",
      label: "Chitrakote Falls",
      isSelected: true,
    });

    expect(icon.options.className).toContain("is-selected");
    expect(icon.options.html).toContain("cg-marker-pulse");
    expect(icon.options.html).toContain("cg-map-marker-selected");
  });

  it("generates shield shape for safety markers", () => {
    const icon = createTourismIcon({
      type: "safety",
      label: "Bastar District Hospital",
    });

    expect(icon.options.html).toContain('aria-label="Bastar District Hospital, safety"');
  });

  it("generates star shape for cultural events", () => {
    const icon = createTourismIcon({
      type: "event",
      label: "Bastar Dussehra",
    });

    expect(icon.options.html).toContain('aria-label="Bastar Dussehra, event"');
  });
});
