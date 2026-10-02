import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MapResultList } from "../MapResultList";
import type { MapEntity } from "@/core/ui/map/entities";

const mockEntities: MapEntity[] = [
  {
    id: "e1",
    type: "place",
    title: "Chitrakote Falls",
    latitude: 19.2,
    longitude: 81.7,
    district: "Bastar",
    description: "Iconic waterfall",
  },
  {
    id: "e2",
    type: "experience",
    title: "Bell Metal Craft",
    latitude: 19.1,
    longitude: 81.8,
    district: "Kondagaon",
  },
];

describe("<MapResultList />", () => {
  it("renders accessible listings for each entity", () => {
    render(
      <MapResultList
        entities={mockEntities}
        onSelectEntity={jest.fn()}
      />,
    );

    expect(screen.getByText("Entities in View (2)")).toBeInTheDocument();
    expect(screen.getByText("Chitrakote Falls")).toBeInTheDocument();
    expect(screen.getByText("Bell Metal Craft")).toBeInTheDocument();
  });

  it("calls onSelectEntity when an item button is clicked", () => {
    const handleSelect = jest.fn();
    render(
      <MapResultList
        entities={mockEntities}
        onSelectEntity={handleSelect}
      />,
    );

    const item = screen.getByText("Chitrakote Falls");
    fireEvent.click(item);

    expect(handleSelect).toHaveBeenCalledWith(mockEntities[0]);
  });

  it("calls onInspectEntity when the inspect arrow is clicked", () => {
    const handleInspect = jest.fn();
    render(
      <MapResultList
        entities={mockEntities}
        onSelectEntity={jest.fn()}
        onInspectEntity={handleInspect}
      />,
    );

    const inspectBtn = screen.getByLabelText("Inspect Chitrakote Falls");
    fireEvent.click(inspectBtn);

    expect(handleInspect).toHaveBeenCalledWith(mockEntities[0]);
  });
});
