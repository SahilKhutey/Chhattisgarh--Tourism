import {
  isRouteActive,
  normalizePath,
  scrollToElement,
  isReducedMotionPreferred,
} from "../navigation";

describe("Navigation route utilities", () => {
  describe("normalizePath", () => {
    it("normalizes trailing slashes and handles query and hash parameters", () => {
      expect(normalizePath("/destinations/")).toBe("/destinations");
      expect(normalizePath("/destinations?sort=popular")).toBe("/destinations");
      expect(normalizePath("/explore#map-section")).toBe("/explore");
      expect(normalizePath("/")).toBe("/");
      expect(normalizePath("")).toBe("/");
    });
  });

  describe("isRouteActive", () => {
    it("correctly identifies active root path with exact match", () => {
      expect(isRouteActive("/", "/")).toBe(true);
      expect(isRouteActive("/destinations", "/")).toBe(false);
    });

    it("matches exact routes", () => {
      expect(isRouteActive("/planner", "/planner", true)).toBe(true);
      expect(isRouteActive("/planner/day-1", "/planner", true)).toBe(false);
    });

    it("matches nested child routes when exact is false", () => {
      expect(isRouteActive("/destinations/bastar", "/destinations")).toBe(true);
      expect(isRouteActive("/destinations/bastar/chitrakote", "/destinations")).toBe(true);
      expect(isRouteActive("/destinations-list", "/destinations")).toBe(false);
    });
  });

  describe("scrollToElement", () => {
    beforeEach(() => {
      window.scrollTo = jest.fn();
    });

    it("returns false if target element does not exist", () => {
      const result = scrollToElement("non-existent-id");
      expect(result).toBe(false);
      expect(window.scrollTo).not.toHaveBeenCalled();
    });

    it("scrolls and focuses when element exists", () => {
      const el = document.createElement("div");
      el.id = "target-section";
      el.getBoundingClientRect = () => ({
        top: 200,
        bottom: 300,
        left: 0,
        right: 100,
        width: 100,
        height: 100,
        x: 0,
        y: 200,
        toJSON: () => {},
      });
      document.body.appendChild(el);

      const result = scrollToElement("target-section", { offset: 50 });
      expect(result).toBe(true);
      expect(window.scrollTo).toHaveBeenCalled();
      expect(document.activeElement).toBe(el);

      document.body.removeChild(el);
    });
  });
});
