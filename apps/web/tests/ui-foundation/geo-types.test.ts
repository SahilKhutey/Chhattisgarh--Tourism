import type {
  GeoCoordinate,
  GeoBounds,
  GeoEntityReference,
} from "@/lib/geo/geo-types";

describe("Geographic UI Contracts", () => {
  it("structures valid GeoCoordinate and GeoBounds", () => {
    const chitrakoteCoord: GeoCoordinate = {
      latitude: 19.201,
      longitude: 81.704,
    };

    const bastarBounds: GeoBounds = {
      north: 19.8,
      south: 18.5,
      east: 82.3,
      west: 81.2,
    };

    expect(chitrakoteCoord.latitude).toBeCloseTo(19.201, 3);
    expect(chitrakoteCoord.longitude).toBeCloseTo(81.704, 3);
    expect(bastarBounds.north).toBeGreaterThan(bastarBounds.south);
    expect(bastarBounds.east).toBeGreaterThan(bastarBounds.west);
  });

  it("handles polymorphic GeoEntityReference types", () => {
    const entities: GeoEntityReference[] = [
      {
        id: "div-bastar",
        type: "division",
        name: "Bastar Division",
      },
      {
        id: "dist-dantewada",
        type: "district",
        name: "Dantewada",
        coordinate: { latitude: 18.9, longitude: 81.35 },
      },
      {
        id: "place-tirathgarh",
        type: "place",
        name: "Tirathgarh Falls",
        coordinate: { latitude: 18.916, longitude: 81.864 },
      },
      {
        id: "safety-sos-jagdalpur",
        type: "safety",
        name: "Jagdalpur Emergency Command Centre",
        coordinate: { latitude: 19.07, longitude: 82.02 },
      },
    ];

    expect(entities).toHaveLength(4);
    expect(entities.map((e) => e.type)).toEqual([
      "division",
      "district",
      "place",
      "safety",
    ]);
  });
});
