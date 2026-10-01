import React from "react";
import { render, screen } from "@testing-library/react";
import { Footer } from "../Footer/Footer";

describe("Footer", () => {
  it("renders the footer landmark and brand narrative", () => {
    render(<Footer />);
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "CG Tourism OS" })).toBeInTheDocument();
  });

  it("contains critical discover, plan, and safety information links", () => {
    render(<Footer />);
    expect(screen.getByRole("link", { name: "Destinations" })).toHaveAttribute("href", "/discover");
    expect(screen.getByRole("link", { name: "Plan a Trip" })).toHaveAttribute("href", "/planner");
    expect(screen.getByRole("link", { name: "Emergency SOS" })).toHaveAttribute("href", "/sos");
    expect(screen.getByRole("link", { name: "Accessibility" })).toHaveAttribute("href", "/accessibility");
  });
});
