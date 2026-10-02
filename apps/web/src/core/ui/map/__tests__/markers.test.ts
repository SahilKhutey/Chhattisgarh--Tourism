import type { MapEntity } from "../entities";
import {
  entityToMarker,
  getMarkerCategoryShape,
  getMarkerPriority,
} from "../markers";

describe("Map Markers System", () => {
  it("converts a MapEntity to a MapMarkerModel correctly", () => {
    const entity: MapEntity = {
      id: "chitrakote",
      type: "place",
      title: "Chitrakote Falls",
      latitude: 19.2012,
      longitude: 81.7058,
      category: "Waterfall",
      district: "Bastar",
    };

    const marker = entityToMarker(entity);
    expect(marker.id).toBe("marker-chitrakote");
    expect(marker.entityId).toBe("chitrakote");
    expect(marker.type).toBe("place");
    expect(marker.latitude).toBe(19.2012);
    expect(marker.longitude).toBe(81.7058);
    expect(marker.label).toBe("Chitrakote Falls");
    expect(marker.priority).toBe(100);
    expect(marker.interactive).toBe(true);
  });

  it("assigns distinctive shapes based on entity category", () => {
    expect(getMarkerCategoryShape("place")).toBe("diamond");
    expect(getMarkerCategoryShape("experience")).toBe("circle");
    expect(getMarkerCategoryShape("event")).toBe("star");
    expect(getMarkerCategoryShape("service")).toBe("ring");
    expect(getMarkerCategoryShape("safety")).toBe("shield");
    expect(getMarkerCategoryShape("guide")).toBe("flag");
  });

  it("calculates marker priorities correctly", () => {
    expect(getMarkerPriority("place")).toBe(100);
    expect(getMarkerPriority("safety")).toBe(90);
    expect(getMarkerPriority("experience")).toBe(80);
    expect(getMarkerPriority("event")).toBe(70);
    expect(getMarkerPriority("guide")).toBe(60);
    expect(getMarkerPriority("service")).toBe(40);

    // Explicit priority override
    expect(getMarkerPriority("service", 95)).toBe(95);
  });
});
