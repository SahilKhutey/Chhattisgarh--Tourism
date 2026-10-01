import {
  isValidBounds,
  isValidCoordinate,
} from "@/core/ui/geo/validation";

describe("geo validation", () => {
  it("accepts valid coordinates", () => {
    expect(
      isValidCoordinate({
        latitude: 21.25,
        longitude: 81.63,
      }),
    ).toBe(true);
  });

  it("rejects invalid latitude", () => {
    expect(
      isValidCoordinate({
        latitude: 120,
        longitude: 81,
      }),
    ).toBe(false);
  });

  it("rejects invalid longitude", () => {
    expect(
      isValidCoordinate({
        latitude: 21,
        longitude: 200,
      }),
    ).toBe(false);
  });

  it("accepts valid bounds", () => {
    expect(
      isValidBounds({
        north: 22,
        south: 20,
        east: 83,
        west: 80,
      }),
    ).toBe(true);
  });

  it("rejects invalid bounds where north is less than south", () => {
    expect(
      isValidBounds({
        north: 18,
        south: 22,
        east: 83,
        west: 80,
      }),
    ).toBe(false);
  });
});
