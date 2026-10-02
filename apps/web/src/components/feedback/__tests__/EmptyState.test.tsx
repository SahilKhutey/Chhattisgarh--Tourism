import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { EmptyState } from "../EmptyState";

describe("EmptyState Component", () => {
  it("renders with title, description, and status role", () => {
    render(
      <EmptyState
        title="No Waterfalls Located"
        description="No waterfalls match the current district selection."
      />,
    );

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("No Waterfalls Located")).toBeInTheDocument();
    expect(screen.getByText("No waterfalls match the current district selection.")).toBeInTheDocument();
  });

  it("handles filter clearing action", () => {
    const handleClear = jest.fn();
    render(
      <EmptyState
        description="Try different filters"
        onClearFilters={handleClear}
        clearLabel="Reset All Filters"
      />,
    );

    const btn = screen.getByRole("button", { name: "Reset All Filters" });
    fireEvent.click(btn);
    expect(handleClear).toHaveBeenCalledTimes(1);
  });

  it("renders navigation link", () => {
    render(
      <EmptyState
        description="No events found"
        actionHref="/events"
        actionLabel="View All Festivals"
      />,
    );

    const link = screen.getByRole("link", { name: "View All Festivals" });
    expect(link).toHaveAttribute("href", "/events");
  });

  it("renders custom action node", () => {
    render(
      <EmptyState
        description="No entries"
        action={<button type="button">Custom Action</button>}
      />,
    );

    expect(screen.getByRole("button", { name: "Custom Action" })).toBeInTheDocument();
  });
});
