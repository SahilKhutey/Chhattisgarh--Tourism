import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { RetryButton } from "../Retry/RetryButton";

describe("RetryButton Component", () => {
  it("renders with custom label and triggers onRetry callback", () => {
    const handleRetry = jest.fn();
    render(<RetryButton onRetry={handleRetry} label="Reload Map Layers" />);

    const btn = screen.getByRole("button", { name: "Reload Map Layers" });
    expect(btn).toBeInTheDocument();

    fireEvent.click(btn);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it("shows loading state and disables button when isLoading is true", () => {
    const handleRetry = jest.fn();
    render(
      <RetryButton
        onRetry={handleRetry}
        isLoading={true}
        loadingLabel="Reconnecting..."
      />,
    );

    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute("aria-busy", "true");
    expect(screen.getByText("Reconnecting...")).toBeInTheDocument();

    fireEvent.click(btn);
    expect(handleRetry).not.toHaveBeenCalled();
  });
});
