import {
  DEFAULT_VIEWPORT,
  CHHATTISGARH_CENTER,
  CHHATTISGARH_DEFAULT_ZOOM,
  CHHATTISGARH_BOUNDS,
  isValidCoordinate,
  isValidBounds,
} from "../viewport";

describe("Map Viewport Contracts", () => {
  it("provides valid default viewport", () => {
    expect(DEFAULT_VIEWPORT.zoom).toBe(CHHATTISGARH_DEFAULT_ZOOM);
    expect(DEFAULT_VIEWPORT.center).toEqual(CHHATTISGARH_CENTER);
    expect(isValidCoordinate(DEFAULT_VIEWPORT.center)).toBe(true);
  });

  it("verifies state bounds geometry", () => {
    expect(isValidBounds(CHHATTISGARH_BOUNDS)).toBe(true);
    expect(CHHATTISGARH_BOUNDS.north).toBeGreaterThan(CHHATTISGARH_BOUNDS.south);
    expect(CHHATTISGARH_BOUNDS.east).toBeGreaterThan(CHHATTISGARH_BOUNDS.west);
  });
});
