import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { SlowNetworkState } from "../SlowNetworkState/SlowNetworkState";

describe("SlowNetworkState", () => {
  it("announces status politely to screen readers", () => {
    render(<SlowNetworkState message="Network latency detected in Bastar corridor." />);
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(screen.getByText("Network latency detected in Bastar corridor.")).toBeInTheDocument();
  });

  it("handles retry connection interaction", () => {
    const handleRetry = jest.fn();
    render(<SlowNetworkState onRetry={handleRetry} />);
    const retryBtn = screen.getByRole("button", { name: "Check connection & retry" });
    fireEvent.click(retryBtn);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });
});
