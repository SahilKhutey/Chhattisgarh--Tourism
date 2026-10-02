import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MapDetailsPanel } from "../Details/MapDetailsPanel";
import type { MapDetailsModel } from "@/core/ui/map/details";

const mockDetails: MapDetailsModel = {
  id: "place-1",
  title: "Chitrakote Falls",
  subtitle: "Bastar District",
  category: "Waterfall",
  district: "Bastar",
  summary: "The Niagara of India on Indravati river.",
  coordinates: { latitude: 19.2012, longitude: 81.7058 },
  highlights: ["Horse-shoe shape", "Rainbow mist", "Boating available"],
  visitingInfo: "Open 6:00 AM - 6:00 PM. Best season: July to October.",
  actions: [
    { id: "explore", label: "Explore Destination", href: "/destinations/chitrakote" },
    { id: "add-to-trip", label: "Add to Trip", action: "add-to-trip" },
  ],
};

describe("<MapDetailsPanel />", () => {
  it("renders destination details, coordinates, highlights, and visiting info", () => {
    render(<MapDetailsPanel details={mockDetails} onClose={jest.fn()} />);

    expect(screen.getByText("Chitrakote Falls")).toBeInTheDocument();
    expect(screen.getByText("Bastar District")).toBeInTheDocument();
    expect(screen.getByText("The Niagara of India on Indravati river.")).toBeInTheDocument();
    expect(screen.getByText("19.2012°N, 81.7058°E")).toBeInTheDocument();
    expect(screen.getByText("Horse-shoe shape")).toBeInTheDocument();
    expect(screen.getByText("Open 6:00 AM - 6:00 PM. Best season: July to October.")).toBeInTheDocument();
  });

  it("calls onClose when the close button is clicked", () => {
    const handleClose = jest.fn();
    render(<MapDetailsPanel details={mockDetails} onClose={handleClose} />);

    const closeBtn = screen.getByLabelText("Close details");
    fireEvent.click(closeBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when the Escape key is pressed", () => {
    const handleClose = jest.fn();
    render(<MapDetailsPanel details={mockDetails} onClose={handleClose} />);

    fireEvent.keyDown(window, { key: "Escape" });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("calls onAction when action button is clicked", () => {
    const handleAction = jest.fn();
    render(
      <MapDetailsPanel
        details={mockDetails}
        onClose={jest.fn()}
        onAction={handleAction}
      />,
    );

    const tripBtn = screen.getByText("Add to Trip");
    fireEvent.click(tripBtn);

    expect(handleAction).toHaveBeenCalledWith("add-to-trip", mockDetails);
  });

  it("renders null when details is null", () => {
    const { container } = render(<MapDetailsPanel details={null} onClose={jest.fn()} />);
    expect(container.firstChild).toBeNull();
  });
});
