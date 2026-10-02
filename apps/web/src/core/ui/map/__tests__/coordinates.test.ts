import {
  isValidCoordinate,
  isValidBounds,
  isCoordinateInBounds,
  calculateCenter,
  CHHATTISGARH_CENTER,
  CHHATTISGARH_BOUNDS,
} from "../viewport";

describe("Geographic Coordinate Validation", () => {
  it("accepts valid coordinates within Chhattisgarh and India", () => {
    expect(isValidCoordinate({ latitude: 21.2514, longitude: 81.6296 })).toBe(true);
    expect(isValidCoordinate({ latitude: 19.07, longitude: 82.02 })).toBe(true);
    expect(isValidCoordinate(CHHATTISGARH_CENTER)).toBe(true);
  });

  it("rejects latitude outside [-90, 90]", () => {
    expect(isValidCoordinate({ latitude: 91, longitude: 81 })).toBe(false);
    expect(isValidCoordinate({ latitude: -91, longitude: 81 })).toBe(false);
    expect(isValidCoordinate({ latitude: 100, longitude: 82 })).toBe(false);
  });

  it("rejects longitude outside [-180, 180]", () => {
    expect(isValidCoordinate({ latitude: 21, longitude: 181 })).toBe(false);
    expect(isValidCoordinate({ latitude: 21, longitude: -181 })).toBe(false);
  });

  it("rejects non-finite coordinate values", () => {
    expect(isValidCoordinate({ latitude: NaN, longitude: 81 })).toBe(false);
    expect(isValidCoordinate({ latitude: 21, longitude: Infinity })).toBe(false);
  });

  it("validates geographic bounds correctly", () => {
    expect(isValidBounds(CHHATTISGARH_BOUNDS)).toBe(true);
    expect(isValidBounds({ north: 10, south: 20, east: 50, west: 40 })).toBe(false);
  });

  it("checks if a coordinate is within geographic bounds", () => {
    expect(isCoordinateInBounds(CHHATTISGARH_CENTER, CHHATTISGARH_BOUNDS)).toBe(true);
    expect(
      isCoordinateInBounds(
        { latitude: 28.6139, longitude: 77.209 }, // New Delhi
        CHHATTISGARH_BOUNDS,
      ),
    ).toBe(false);
  });

  it("calculates geometric center of coordinates", () => {
    const coords = [
      { latitude: 20, longitude: 80 },
      { latitude: 22, longitude: 82 },
    ];
    const center = calculateCenter(coords);
    expect(center.latitude).toBe(21);
    expect(center.longitude).toBe(81);
  });

  it("returns default center when calculating center of empty array", () => {
    expect(calculateCenter([])).toEqual(CHHATTISGARH_CENTER);
  });
});
