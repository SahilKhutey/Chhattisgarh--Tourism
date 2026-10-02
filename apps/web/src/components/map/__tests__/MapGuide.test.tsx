import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MapGuide } from "../Guides/MapGuide";
import type { MapGuide as MapGuideModel } from "@/core/ui/map/guides";

const mockGuide: MapGuideModel = {
  id: "guide-kanger",
  title: "Kanger Valley Forest Trail",
  description: "A breathtaking subterranean and waterfall trail.",
  estimatedDurationMinutes: 180,
  steps: [
    { id: "s1", title: "Kanger Entry Post", order: 1, durationMinutes: 20 },
    { id: "s2", title: "Kotumsar Cave Exploration", order: 2, durationMinutes: 90 },
    { id: "s3", title: "Tirathgarh Falls Viewing", order: 3, durationMinutes: 70 },
  ],
};

describe("<MapGuide />", () => {
  it("renders guide title, duration, and ordered steps", () => {
    render(
      <MapGuide
        guide={mockGuide}
        activeStepId="s1"
        onSelectStep={jest.fn()}
        onClose={jest.fn()}
      />,
    );

    expect(screen.getByText("Kanger Valley Forest Trail")).toBeInTheDocument();
    expect(screen.getByText("Est. 180 mins total")).toBeInTheDocument();
    expect(screen.getByText("Kanger Entry Post")).toBeInTheDocument();
    expect(screen.getByText("Kotumsar Cave Exploration")).toBeInTheDocument();
    expect(screen.getByText("Tirathgarh Falls Viewing")).toBeInTheDocument();
    expect(screen.getByText("Step 1 of 3")).toBeInTheDocument();
  });

  it("handles next and previous step transitions", () => {
    const handleSelectStep = jest.fn();
    render(
      <MapGuide
        guide={mockGuide}
        activeStepId="s1"
        onSelectStep={handleSelectStep}
        onClose={jest.fn()}
      />,
    );

    const nextBtn = screen.getByLabelText("Next trail step");
    fireEvent.click(nextBtn);

    expect(handleSelectStep).toHaveBeenCalledWith(mockGuide.steps[1]);
  });

  it("calls onClose when close button clicked", () => {
    const handleClose = jest.fn();
    render(
      <MapGuide
        guide={mockGuide}
        activeStepId="s1"
        onSelectStep={jest.fn()}
        onClose={handleClose}
      />,
    );

    const closeBtn = screen.getByLabelText("Close guide");
    fireEvent.click(closeBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
