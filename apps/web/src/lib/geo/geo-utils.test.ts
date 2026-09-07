import {
  formatDistance,
  formatDuration,
  haversineDistanceKm,
  isPointInChhattisgarh,
} from "./geo-utils";

describe("geo-utils", () => {
  describe("haversineDistanceKm", () => {
    it("returns 0 for identical points", () => {
      expect(haversineDistanceKm(21.25, 81.63, 21.25, 81.63)).toBe(0);
    });

    it("calculates approximate distance between Raipur and Bilaspur (~110 km)", () => {
      const dist = haversineDistanceKm(21.2514, 81.6296, 22.0797, 82.1409);
      expect(dist).toBeGreaterThan(95);
      expect(dist).toBeLessThan(125);
    });
  });

  describe("isPointInChhattisgarh", () => {
    it("accepts Raipur (21.25, 81.63)", () => {
      expect(isPointInChhattisgarh(21.25, 81.63)).toBe(true);
    });

    it("accepts Chitrakote, Bastar (19.20, 81.70)", () => {
      expect(isPointInChhattisgarh(19.2, 81.7)).toBe(true);
    });

    it("accepts Mainpat, Surguja (22.82, 83.29)", () => {
      expect(isPointInChhattisgarh(22.82, 83.29)).toBe(true);
    });

    it("rejects New Delhi (28.61, 77.20)", () => {
      expect(isPointInChhattisgarh(28.61, 77.2)).toBe(false);
    });

    it("rejects Mumbai (19.07, 72.87)", () => {
      expect(isPointInChhattisgarh(19.07, 72.87)).toBe(false);
    });
  });

  describe("formatDistance", () => {
    it("formats meters below 1000m", () => {
      expect(formatDistance(450)).toBe("450 m");
    });

    it("formats kilometers for 1000m and above", () => {
      expect(formatDistance(12500)).toBe("12.5 km");
    });
  });

  describe("formatDuration", () => {
    it("formats minutes below 60", () => {
      expect(formatDuration(1800)).toBe("30 min");
    });

    it("formats hours and minutes above 60", () => {
      expect(formatDuration(5400)).toBe("1h 30m");
    });

    it("formats exact hours cleanly", () => {
      expect(formatDuration(7200)).toBe("2h");
    });
  });
});
