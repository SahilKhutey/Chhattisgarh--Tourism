import {
  consumerNavigation,
  defaultBottomNavigationItems,
} from "@/core/ui/shell/navigation";
import {
  SHELL_BREAKPOINTS,
  getSafeAreaStyles,
} from "@/core/ui/shell/responsive";

describe("Consumer Shell Contracts", () => {
  describe("consumerNavigation", () => {
    it("defines consumer-oriented navigation groups without exposing database schemas", () => {
      const groupIds = consumerNavigation.map((g) => g.id);
      expect(groupIds).toContain("discover");
      expect(groupIds).toContain("plan");
      expect(groupIds).toContain("community");

      // Verify no internal backend concepts are present in group labels
      consumerNavigation.forEach((group) => {
        expect(group.label).not.toMatch(/place|entity|table|record|schema/i);
        expect(group.items.length).toBeGreaterThan(0);
      });
    });

    it("ensures all navigation items have valid hrefs and priority assignments", () => {
      consumerNavigation.forEach((group) => {
        group.items.forEach((item) => {
          expect(item.href).toMatch(/^\/[a-zA-Z0-9\-_/]*$/);
          expect(["primary", "secondary", "contextual"]).toContain(item.priority);
          expect(item.audience).toBe("consumer");
        });
      });
    });
  });

  describe("defaultBottomNavigationItems", () => {
    it("contains high-frequency consumer touchpoints with maximum of 5 items", () => {
      expect(defaultBottomNavigationItems.length).toBeLessThanOrEqual(5);
      const labels = defaultBottomNavigationItems.map((item) => item.label);
      expect(labels).toEqual(["Home", "Discover", "Plan", "Saved", "Account"]);
    });
  });

  describe("SHELL_BREAKPOINTS & Safe Area", () => {
    it("adheres to standard responsive breakpoints", () => {
      expect(SHELL_BREAKPOINTS.mobileMax).toBe(767);
      expect(SHELL_BREAKPOINTS.tabletMin).toBe(768);
      expect(SHELL_BREAKPOINTS.desktopMin).toBe(1024);
      expect(SHELL_BREAKPOINTS.wideMin).toBe(1280);
    });

    it("returns safe area CSS environment variables", () => {
      const safeArea = getSafeAreaStyles();
      expect(safeArea.paddingBottom).toContain("safe-area-inset-bottom");
      expect(safeArea.paddingTop).toContain("safe-area-inset-top");
    });
  });
});
