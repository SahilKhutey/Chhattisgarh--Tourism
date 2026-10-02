import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MapExperience } from "../MapExperience/MapExperience";
import type { MapEntity } from "@/core/ui/map/entities";

// Mock MapCanvas & Leaflet primitives to run cleanly in JSDOM
jest.mock("../MapCanvas/MapCanvas", () => ({
  MapCanvas: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-map-canvas">{children}</div>
  ),
}));

jest.mock("../Markers/TourismMarker", () => ({
  TourismMarker: ({ entity, onSelect }: { entity: MapEntity; onSelect: (e: MapEntity) => void }) => (
    <button
      type="button"
      data-testid={`mock-marker-${entity.id}`}
      onClick={() => onSelect(entity)}
    >
      {entity.title}
    </button>
  ),
}));

jest.mock("../Routes/RouteLayer", () => ({
  RouteLayer: () => <div data-testid="mock-route-layer" />,
}));

const mockEntities: MapEntity[] = [
  {
    id: "p1",
    type: "place",
    title: "Chitrakote Falls",
    latitude: 19.2,
    longitude: 81.7,
    district: "Bastar",
    category: "Waterfall",
    priority: 100,
  },
  {
    id: "p2",
    type: "experience",
    title: "Kanger Valley Forest Safari",
    latitude: 18.9,
    longitude: 81.8,
    district: "Bastar",
    category: "Wildlife",
    priority: 80,
  },
];

describe("<MapExperience />", () => {
  it("renders observer container, overview HUD, canvas, controls, and result list", () => {
    render(
      <MapExperience
        entities={mockEntities}
        regionName="Bastar Explorer"
        initialViewport={{ center: { latitude: 19.2, longitude: 81.7 }, zoom: 10 }}
      />,
    );

    expect(screen.getByLabelText("Tourism geographic observer experience")).toBeInTheDocument();
    expect(screen.getByTestId("mock-map-canvas")).toBeInTheDocument();
    expect(screen.getByText("Bastar Explorer")).toBeInTheDocument();
    expect(screen.getByLabelText("Map zoom controls")).toBeInTheDocument();
    expect(screen.getByLabelText("Map layers and basemap selector")).toBeInTheDocument();
    expect(screen.getByLabelText("Map destination and experience listings")).toBeInTheDocument();
  });

  it("selects entity and opens details panel when marker or list item is clicked", () => {
    render(
      <MapExperience
        entities={mockEntities}
        initialViewport={{ center: { latitude: 19.2, longitude: 81.7 }, zoom: 10 }}
      />,
    );

    // Click on marker
    const marker = screen.getByTestId("mock-marker-p1");
    fireEvent.click(marker);

    // Details panel opens
    expect(
      screen.getByRole("dialog", { name: "Chitrakote Falls geographic details" }),
    ).toBeInTheDocument();
  });

  it("closes details panel when close button clicked", () => {
    render(
      <MapExperience
        entities={mockEntities}
        initialSelectedId="p1"
        initialViewport={{ center: { latitude: 19.2, longitude: 81.7 }, zoom: 10 }}
      />,
    );

    const closeBtn = screen.getByLabelText("Close details");
    fireEvent.click(closeBtn);

    expect(
      screen.queryByRole("dialog", { name: "Chitrakote Falls geographic details" }),
    ).not.toBeInTheDocument();
  });
});
