import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorState, NetworkError, NotFoundState } from "../ErrorState";

describe("ErrorState Components", () => {
  it("renders ErrorState with title and description and alert role", () => {
    render(
      <ErrorState
        title="Failed to Load Sanctuary"
        description="Barnawapara details could not be retrieved."
        code="NETWORK_ERR"
        requestId="req-barnawapara-1"
      />,
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Failed to Load Sanctuary")).toBeInTheDocument();
    expect(screen.getByText("Barnawapara details could not be retrieved.")).toBeInTheDocument();
    expect(screen.getByText(/Ref: NETWORK_ERR/i)).toBeInTheDocument();
    expect(screen.getByText(/ID: req-barnawapara-1/i)).toBeInTheDocument();
  });

  it("handles retry action", () => {
    const handleRetry = jest.fn();
    render(
      <ErrorState
        description="Service unavailable"
        onRetry={handleRetry}
        retryLabel="Try Again Now"
      />,
    );

    const btn = screen.getByRole("button", { name: "Try Again Now" });
    fireEvent.click(btn);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it("renders NetworkError with specific offline/network guidance", () => {
    const handleRetry = jest.fn();
    render(
      <NetworkError
        onRetry={handleRetry}
        title="Offline Mode Active"
      />,
    );

    expect(screen.getByText("Offline Mode Active")).toBeInTheDocument();
    const btn = screen.getByRole("button", { name: "Check Connection & Try Again" });
    fireEvent.click(btn);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it("renders NotFoundState with action link", () => {
    render(
      <NotFoundState
        title="Route Not Found"
        description="The trail coordinate does not exist."
        actionHref="/explore"
        actionLabel="Back to Explorer"
      />,
    );

    expect(screen.getByText("Route Not Found")).toBeInTheDocument();
    const link = screen.getByRole("link", { name: "Back to Explorer" });
    expect(link).toHaveAttribute("href", "/explore");
  });
});
