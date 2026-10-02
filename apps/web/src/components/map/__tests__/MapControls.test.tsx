import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MapControls } from "../MapControls/MapControls";

describe("<MapControls />", () => {
  it("renders zoom, locate, reset view, and fullscreen buttons", () => {
    const handleZoomIn = jest.fn();
    const handleZoomOut = jest.fn();
    const handleReset = jest.fn();
    const handleToggleFs = jest.fn();

    render(
      <MapControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onLocate={jest.fn()}
        onResetView={handleReset}
        isFullscreen={false}
        onToggleFullscreen={handleToggleFs}
      />,
    );

    const zoomInBtn = screen.getByLabelText("Zoom in");
    const zoomOutBtn = screen.getByLabelText("Zoom out");
    const resetBtn = screen.getByLabelText("Reset map view to Chhattisgarh state");
    const fsBtn = screen.getByLabelText("Enter fullscreen observer map");

    fireEvent.click(zoomInBtn);
    expect(handleZoomIn).toHaveBeenCalledTimes(1);

    fireEvent.click(zoomOutBtn);
    expect(handleZoomOut).toHaveBeenCalledTimes(1);

    fireEvent.click(resetBtn);
    expect(handleReset).toHaveBeenCalledTimes(1);

    fireEvent.click(fsBtn);
    expect(handleToggleFs).toHaveBeenCalledTimes(1);
  });
});
