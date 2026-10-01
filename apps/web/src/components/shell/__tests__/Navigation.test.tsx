import React from "react";
import { render, screen } from "@testing-library/react";
import { PrimaryNavigation } from "../Navigation/PrimaryNavigation";
import { NavigationItem } from "../Navigation/NavigationItem";
import { SecondaryNavigation } from "../Navigation/SecondaryNavigation";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  usePathname: () => "/discover",
}));

describe("Navigation Components", () => {
  describe("PrimaryNavigation", () => {
    it("renders consumer navigation links", () => {
      render(<PrimaryNavigation />);
      expect(screen.getByRole("navigation", { name: "Primary navigation" })).toBeInTheDocument();
      expect(screen.getByText("Discover")).toBeInTheDocument();
      expect(screen.getByText("Plan")).toBeInTheDocument();
      expect(screen.getByText("Community")).toBeInTheDocument();
    });
  });

  describe("NavigationItem", () => {
    it("marks the active route with aria-current='page'", () => {
      render(
        <NavigationItem
          item={{
            id: "discover",
            label: "Discover",
            href: "/discover",
            priority: "primary",
            audience: "consumer",
          }}
        />,
      );

      const link = screen.getByRole("link", { name: "Discover" });
      expect(link).toHaveAttribute("aria-current", "page");
    });

    it("does not set aria-current for inactive links", () => {
      render(
        <NavigationItem
          item={{
            id: "planner",
            label: "Plan",
            href: "/planner",
            priority: "primary",
            audience: "consumer",
          }}
        />,
      );

      const link = screen.getByRole("link", { name: "Plan" });
      expect(link).not.toHaveAttribute("aria-current");
    });
  });

  describe("SecondaryNavigation", () => {
    it("renders group heading and child links", () => {
      render(
        <SecondaryNavigation
          group={{
            id: "plan",
            label: "Plan",
            items: [
              {
                id: "planner",
                label: "Plan a Trip",
                href: "/planner",
                priority: "primary",
                audience: "consumer",
              },
            ],
          }}
        />,
      );

      expect(screen.getByText("Plan")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Plan a Trip" })).toBeInTheDocument();
    });
  });
});
