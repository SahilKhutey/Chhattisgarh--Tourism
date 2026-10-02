import type { MapEntity } from "../entities";
import {
  sortEntitiesByPriority,
  filterEntitiesByZoom,
  filterEntitiesByLayers,
} from "../entities";

const sampleEntities: MapEntity[] = [
  {
    id: "place-1",
    type: "place",
    title: "Chitrakote Falls",
    latitude: 19.2012,
    longitude: 81.7058,
    priority: 100,
  },
  {
    id: "exp-1",
    type: "experience",
    title: "Bastar Tribal Craft Walk",
    latitude: 19.08,
    longitude: 82.03,
    priority: 70,
  },
  {
    id: "service-1",
    type: "service",
    title: "Chitrakote Eco Resort",
    latitude: 19.205,
    longitude: 81.708,
    priority: 30,
  },
  {
    id: "district-1",
    type: "district",
    title: "Bastar District",
    latitude: 19.1,
    longitude: 81.9,
    priority: 90,
  },
];

describe("Map Entity Filtering and Ordering", () => {
  it("sorts entities descending by priority", () => {
    const sorted = sortEntitiesByPriority(sampleEntities);
    expect(sorted[0].id).toBe("place-1");
    expect(sorted[sorted.length - 1].id).toBe("service-1");
  });

  it("filters entities based on scale-dependent zoom", () => {
    // Zoom 7: State/Division overview - district visible, service not visible
    const atZoom7 = filterEntitiesByZoom(sampleEntities, 7);
    expect(atZoom7.some((e) => e.id === "district-1")).toBe(true);
    expect(atZoom7.some((e) => e.id === "service-1")).toBe(false);

    // Zoom 15: Detailed zoom - services become visible
    const atZoom15 = filterEntitiesByZoom(sampleEntities, 15);
    expect(atZoom15.some((e) => e.id === "service-1")).toBe(true);
    expect(atZoom15.some((e) => e.id === "place-1")).toBe(true);
  });

  it("filters entities by enabled layers", () => {
    // Only destinations enabled
    const onlyDestinations = filterEntitiesByLayers(sampleEntities, ["tourism-destinations"]);
    expect(onlyDestinations.every((e) => e.type === "place")).toBe(true);
    expect(onlyDestinations.some((e) => e.id === "place-1")).toBe(true);
    expect(onlyDestinations.some((e) => e.id === "exp-1")).toBe(false);

    // Destinations and experiences
    const destAndExp = filterEntitiesByLayers(sampleEntities, [
      "tourism-destinations",
      "tourism-experiences",
    ]);
    expect(destAndExp.some((e) => e.id === "place-1")).toBe(true);
    expect(destAndExp.some((e) => e.id === "exp-1")).toBe(true);
    expect(destAndExp.some((e) => e.id === "service-1")).toBe(false);
  });
});
