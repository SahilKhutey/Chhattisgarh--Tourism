import {
  isRouteActive,
  normalizePath,
} from "@/core/ui/navigation/active-route";

describe("Navigation Route State & Matching", () => {
  describe("normalizePath", () => {
    it("strips queries and hashes", () => {
      expect(normalizePath("/discover?category=waterfalls")).toBe("/discover");
      expect(normalizePath("/planner#day-1")).toBe("/planner");
      expect(normalizePath("/map?lat=19.07&lng=81.96#view")).toBe("/map");
    });

    it("strips trailing slashes from non-root paths", () => {
      expect(normalizePath("/discover/")).toBe("/discover");
      expect(normalizePath("/")).toBe("/");
    });
  });

  describe("isRouteActive", () => {
    it("matches root route only when exactly on root", () => {
      expect(isRouteActive("/", "/")).toBe(true);
      expect(isRouteActive("/discover", "/")).toBe(false);
    });

    it("matches exact paths", () => {
      expect(isRouteActive("/discover", "/discover")).toBe(true);
      expect(isRouteActive("/planner", "/planner")).toBe(true);
    });

    it("matches nested sub-routes correctly", () => {
      expect(isRouteActive("/discover/destinations", "/discover")).toBe(true);
      expect(isRouteActive("/discover/destinations/chitrakote", "/discover")).toBe(true);
    });

    it("does NOT match false prefix collisions", () => {
      // /discoveries must not match /discover
      expect(isRouteActive("/discoveries", "/discover")).toBe(false);
      expect(isRouteActive("/planning", "/plan")).toBe(false);
    });

    it("enforces strict matching when exact flag is true", () => {
      expect(isRouteActive("/discover/destinations", "/discover", true)).toBe(false);
      expect(isRouteActive("/discover", "/discover", true)).toBe(true);
    });
  });
});
