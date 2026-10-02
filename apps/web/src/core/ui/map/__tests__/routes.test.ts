import type { MapRoute } from "../routes";
import { isValidRoute, calculateRouteDistance } from "../routes";

describe("Map Routes Contract", () => {
  const validRoute: MapRoute = {
    id: "route-bastar",
    title: "Bastar Waterfalls Circuit",
    coordinates: [
      { latitude: 19.07, longitude: 82.02 }, // Jagdalpur
      { latitude: 19.2, longitude: 81.7 }, // Chitrakote
      { latitude: 18.9, longitude: 81.86 }, // Tirathgarh
    ],
    stops: ["Jagdalpur", "Chitrakote", "Tirathgarh"],
  };

  it("validates well-formed routes", () => {
    expect(isValidRoute(validRoute)).toBe(true);
  });

  it("rejects routes with fewer than 2 coordinates", () => {
    expect(
      isValidRoute({
        id: "short",
        title: "Short",
        coordinates: [{ latitude: 19.07, longitude: 82.02 }],
      }),
    ).toBe(false);
  });

  it("rejects routes with invalid coordinates", () => {
    expect(
      isValidRoute({
        id: "invalid",
        title: "Invalid",
        coordinates: [
          { latitude: 19.07, longitude: 82.02 },
          { latitude: 999, longitude: 81.7 },
        ],
      }),
    ).toBe(false);
  });

  it("calculates realistic geographic distance along route", () => {
    const distanceMeters = calculateRouteDistance(validRoute.coordinates);
    expect(distanceMeters).toBeGreaterThan(40000); // > 40 km
    expect(distanceMeters).toBeLessThan(120000); // < 120 km
  });
});
