import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MapOverview } from "../Overview/MapOverview";
import type { MapEntity } from "@/core/ui/map/entities";

const mockEntities: MapEntity[] = [
  { id: "1", type: "place", title: "Chitrakote", latitude: 19.2, longitude: 81.7 },
  { id: "2", type: "place", title: "Tirathgarh", latitude: 18.9, longitude: 81.8 },
  { id: "3", type: "experience", title: "Tribal Dance", latitude: 19.1, longitude: 81.9 },
  { id: "4", type: "route", title: "Scenic Corridor", latitude: 19.0, longitude: 81.7 },
];

describe("<MapOverview />", () => {
  it("renders observer console title and region name", () => {
    render(<MapOverview entities={mockEntities} regionName="Bastar Division" zoom={10.2} />);

    expect(screen.getByText("Observer Console")).toBeInTheDocument();
    expect(screen.getByText("Bastar Division")).toBeInTheDocument();
    expect(screen.getByText("Z10.2")).toBeInTheDocument();
  });

  it("calculates and displays destination, experience, and corridor counts", () => {
    render(<MapOverview entities={mockEntities} routesCount={5} />);

    expect(screen.getByText("2")).toBeInTheDocument(); // 2 places
    expect(screen.getByText("Places")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument(); // 1 experience
    expect(screen.getByText("Experiences")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument(); // 5 routes
    expect(screen.getByText("Corridors")).toBeInTheDocument();
  });

  it("toggles collapse and expand", () => {
    render(<MapOverview entities={mockEntities} />);

    const toggleButton = screen.getByLabelText("Collapse overview");
    fireEvent.click(toggleButton);

    expect(screen.queryByText("Places")).not.toBeInTheDocument();

    const expandButton = screen.getByLabelText("Expand overview");
    fireEvent.click(expandButton);

    expect(screen.getByText("Places")).toBeInTheDocument();
  });
});
