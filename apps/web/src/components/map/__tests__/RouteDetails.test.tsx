import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { RouteDetails } from "../Routes/RouteDetails";
import type { MapRoute } from "@/core/ui/map/routes";

const mockRoute: MapRoute = {
  id: "bastar-circuit",
  title: "Bastar Waterfalls Circuit",
  distanceMeters: 86000,
  durationMinutes: 160,
  difficulty: "Scenic",
  stops: ["Jagdalpur", "Chitrakote Falls", "Tirathgarh Falls"],
  coordinates: [
    { latitude: 19.07, longitude: 82.02 },
    { latitude: 19.2, longitude: 81.7 },
    { latitude: 18.9, longitude: 81.86 },
  ],
};

describe("<RouteDetails />", () => {
  it("renders route metrics and stops timeline", () => {
    render(<RouteDetails route={mockRoute} onClose={jest.fn()} />);

    expect(screen.getByText("Bastar Waterfalls Circuit")).toBeInTheDocument();
    expect(screen.getByText("86.0 km")).toBeInTheDocument();
    expect(screen.getByText("2h 40m")).toBeInTheDocument();
    expect(screen.getByText("Scenic")).toBeInTheDocument();
    expect(screen.getByText("Jagdalpur")).toBeInTheDocument();
    expect(screen.getByText("Chitrakote Falls")).toBeInTheDocument();
    expect(screen.getByText("Tirathgarh Falls")).toBeInTheDocument();
  });

  it("calls onClose when close button clicked", () => {
    const handleClose = jest.fn();
    render(<RouteDetails route={mockRoute} onClose={handleClose} />);

    const closeBtn = screen.getByLabelText("Close route details");
    fireEvent.click(closeBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("calls onAddToTrip when add to trip button clicked", () => {
    const handleAdd = jest.fn();
    render(<RouteDetails route={mockRoute} onClose={jest.fn()} onAddToTrip={handleAdd} />);

    const addBtn = screen.getByLabelText("Add corridor to trip");
    fireEvent.click(addBtn);

    expect(handleAdd).toHaveBeenCalledWith(mockRoute);
  });
});
