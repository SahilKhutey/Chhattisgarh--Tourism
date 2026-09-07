import { getNearbyPlaces, getPlacesInBounds, getRoute } from "./geo-api";

describe("geo-api", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it("getNearbyPlaces builds valid query and calls endpoint", async () => {
    const mockData = [{ id: "1", name: "Chitrakote", latitude: 19.2, longitude: 81.7, distanceMeters: 500 }];
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });

    const result = await getNearbyPlaces(19.2, 81.7, 10000, 25);
    expect(global.fetch).toHaveBeenCalled();
    const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0];
    expect(calledUrl).toContain("/api/v1/geo/nearby");
    expect(calledUrl).toContain("latitude=19.2");
    expect(calledUrl).toContain("longitude=81.7");
    expect(calledUrl).toContain("radiusMeters=10000");
    expect(calledUrl).toContain("limit=25");
    expect(result).toEqual(mockData);
  });

  it("getPlacesInBounds sends correct bounds query", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    await getPlacesInBounds({ north: 24, south: 20, east: 84, west: 80 }, 50);
    const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0];
    expect(calledUrl).toContain("/api/v1/geo/bounds");
    expect(calledUrl).toContain("north=24");
    expect(calledUrl).toContain("south=20");
  });

  it("getRoute sends origin and destination coordinates", async () => {
    const mockRoute = { distanceMeters: 50000, durationSeconds: 3600, geometry: [] };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockRoute,
    });

    const result = await getRoute(21.25, 81.63, 22.08, 82.14);
    const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0];
    expect(calledUrl).toContain("/api/v1/geo/route");
    expect(calledUrl).toContain("originLat=21.25");
    expect(calledUrl).toContain("destLat=22.08");
    expect(result).toEqual(mockRoute);
  });
});
