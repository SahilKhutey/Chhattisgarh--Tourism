import React from "react";
import { render, screen } from "@testing-library/react";
import { BottomNavigation } from "../BottomNavigation/BottomNavigation";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  usePathname: () => "/planner",
}));

describe("BottomNavigation", () => {
  it("renders mobile bottom navigation bar with accessible role", () => {
    render(<BottomNavigation />);
    expect(screen.getByRole("navigation", { name: "Mobile bottom navigation" })).toBeInTheDocument();
  });

  it("marks current active route with aria-current='page'", () => {
    render(<BottomNavigation />);
    const planLink = screen.getByRole("link", { name: "Plan" });
    expect(planLink).toHaveAttribute("aria-current", "page");

    const homeLink = screen.getByRole("link", { name: "Home" });
    expect(homeLink).not.toHaveAttribute("aria-current");
  });
});
