import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { OfflineState } from "../OfflineState/OfflineState";

describe("OfflineState", () => {
  it("informs user that cached tourism data remains available", () => {
    render(
      <OfflineState
        message="You are currently offline."
        cachedDataAvailable={true}
      />
    );
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("You are currently offline.")).toBeInTheDocument();
    expect(screen.getByText(/Cached data is available for offline browsing/i)).toBeInTheDocument();
  });

  it("handles retry action when specified", () => {
    const onRetry = jest.fn();
    render(<OfflineState onRetry={onRetry} />);
    const button = screen.getByRole("button", { name: "Retry connection" });
    fireEvent.click(button);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
