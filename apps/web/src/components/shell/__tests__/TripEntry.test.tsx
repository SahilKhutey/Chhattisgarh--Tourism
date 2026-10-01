import React from "react";
import { render, screen } from "@testing-library/react";
import { TripEntry } from "../TripEntry/TripEntry";

describe("TripEntry", () => {
  it("renders default Plan link", () => {
    render(<TripEntry />);
    const link = screen.getByRole("link", { name: "Plan a trip" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/planner");
  });

  it("renders active trips label when count is provided", () => {
    render(<TripEntry activeTripCount={3} />);
    const link = screen.getByRole("link", { name: "My Trips, 3 items" });
    expect(link).toBeInTheDocument();
    expect(screen.getByText("Trips · 3")).toBeInTheDocument();
  });
});
