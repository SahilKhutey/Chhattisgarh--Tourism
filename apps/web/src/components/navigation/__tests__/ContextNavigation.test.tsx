import React from "react";
import { render, screen } from "@testing-library/react";
import { ContextNavigation } from "../ContextNavigation/ContextNavigation";

describe("ContextNavigation", () => {
  const items = [
    { id: "overview", label: "Overview", href: "#overview", anchor: "#overview" },
    { id: "experiences", label: "Experiences", href: "#experiences", anchor: "#experiences" },
    { id: "map", label: "Map", href: "#map", anchor: "#map" },
    { id: "safety", label: "Safety", href: "#safety", anchor: "#safety" },
  ];

  it("renders contextual sticky navigation bar", () => {
    render(<ContextNavigation title="Bastar Corridor" items={items} />);
    expect(screen.getByRole("navigation", { name: "Bastar Corridor" })).toBeInTheDocument();
    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("Experiences")).toBeInTheDocument();
  });

  it("highlights active anchor correctly", () => {
    render(<ContextNavigation items={items} activeAnchor="#experiences" />);
    const activeLink = screen.getByRole("link", { name: "Experiences" });
    expect(activeLink).toHaveClass("bg-primary");
  });

  it("returns null when no items are provided", () => {
    const { container } = render(<ContextNavigation items={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
