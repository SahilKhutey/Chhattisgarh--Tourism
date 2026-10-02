import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { LayerControl } from "../MapLayers/LayerControl";

describe("<LayerControl />", () => {
  it("renders layer trigger and opens settings modal", () => {
    render(
      <LayerControl
        enabledLayers={["tourism-destinations"]}
        baseLayer="standard"
        onToggleLayer={jest.fn()}
        onSelectBaseLayer={jest.fn()}
      />,
    );

    const trigger = screen.getByLabelText("Map layers and basemap selector");
    expect(trigger).toBeInTheDocument();

    fireEvent.click(trigger);

    expect(screen.getByText("Map Configuration")).toBeInTheDocument();
    expect(screen.getByText("Basemap Style")).toBeInTheDocument();
    expect(screen.getByText("Geographic Layers")).toBeInTheDocument();
    expect(screen.getByText("Map Symbology")).toBeInTheDocument();
  });

  it("calls onSelectBaseLayer when basemap button clicked", () => {
    const handleSelectBase = jest.fn();
    render(
      <LayerControl
        enabledLayers={["tourism-destinations"]}
        baseLayer="standard"
        onToggleLayer={jest.fn()}
        onSelectBaseLayer={handleSelectBase}
      />,
    );

    fireEvent.click(screen.getByLabelText("Map layers and basemap selector"));

    const satelliteBtn = screen.getByText("satellite");
    fireEvent.click(satelliteBtn);

    expect(handleSelectBase).toHaveBeenCalledWith("satellite");
  });

  it("calls onToggleLayer when layer checkbox clicked", () => {
    const handleToggle = jest.fn();
    render(
      <LayerControl
        enabledLayers={["tourism-destinations"]}
        baseLayer="standard"
        onToggleLayer={handleToggle}
        onSelectBaseLayer={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByLabelText("Map layers and basemap selector"));

    const expCheckbox = screen.getByLabelText("Experiences");
    fireEvent.click(expCheckbox);

    expect(handleToggle).toHaveBeenCalledWith("tourism-experiences");
  });
});
