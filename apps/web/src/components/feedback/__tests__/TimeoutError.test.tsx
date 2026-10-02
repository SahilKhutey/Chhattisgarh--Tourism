import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { TimeoutError } from "../ErrorState/TimeoutError";

describe("TimeoutError Component", () => {
  it("renders with default timeout message and alert role", () => {
    render(<TimeoutError />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("This is taking longer than expected")).toBeInTheDocument();
    expect(screen.getByText(/The connection took too long to respond/i)).toBeInTheDocument();
  });

  it("triggers onRetry callback on button click", () => {
    const handleRetry = jest.fn();
    render(<TimeoutError onRetry={handleRetry} retryLabel="Retry Connection" />);

    const retryBtn = screen.getByRole("button", { name: "Retry Connection" });
    fireEvent.click(retryBtn);

    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it("renders navigation link if specified", () => {
    render(
      <TimeoutError
        continueHref="/discover"
        continueLabel="Browse Cached Guides"
      />,
    );

    const link = screen.getByRole("link", { name: "Browse Cached Guides" });
    expect(link).toHaveAttribute("href", "/discover");
  });
});
