/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { EmptyState } from "@/components/states/EmptyState";
import { ErrorState } from "@/components/states/ErrorState";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { mockFetch, restoreFetch } from "../testing/test-utils";

describe("Core Component Suite", () => {
  afterEach(() => {
    restoreFetch();
  });

  describe("EmptyState Component", () => {
    it("renders title and description correctly", () => {
      render(
        <EmptyState
          title="No Destinations Found"
          description="Try adjusting your filters or search keywords."
        />,
      );

      expect(screen.getByText("No Destinations Found")).toBeInTheDocument();
      expect(
        screen.getByText("Try adjusting your filters or search keywords."),
      ).toBeInTheDocument();
    });

    it("renders custom action when provided", () => {
      render(
        <EmptyState
          title="No Items"
          description="Nothing here"
          action={<button>Reset Filters</button>}
        />,
      );

      expect(
        screen.getByRole("button", { name: "Reset Filters" }),
      ).toBeInTheDocument();
    });
  });

  describe("ErrorState Component", () => {
    it("renders error alert with title and description", () => {
      const testError = new Error("Network error");
      render(
        <ErrorState
          error={testError}
          title="Failed to Load Destinations"
          description="Could not connect to the remote server."
        />,
      );

      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(
        screen.getByText("Failed to Load Destinations"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Could not connect to the remote server."),
      ).toBeInTheDocument();
    });

    it("triggers reset callback on button click", () => {
      const resetMock = jest.fn();
      const testError = new Error("Test error");
      render(<ErrorState error={testError} reset={resetMock} />);

      const retryButton = screen.getByRole("button", { name: /try again/i });
      fireEvent.click(retryButton);
      expect(resetMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("UI Primitives (Button & Card)", () => {
    it("renders Button with variants and handles click events", () => {
      const handleClick = jest.fn();
      render(
        <Button variant="primary" onClick={handleClick}>
          Explore Now
        </Button>,
      );

      const btn = screen.getByRole("button", { name: "Explore Now" });
      expect(btn).toBeInTheDocument();
      fireEvent.click(btn);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("renders disabled Button and does not trigger click", () => {
      const handleClick = jest.fn();
      render(
        <Button disabled onClick={handleClick}>
          Disabled Action
        </Button>,
      );

      const btn = screen.getByRole("button", { name: "Disabled Action" });
      expect(btn).toBeDisabled();
      fireEvent.click(btn);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it("renders Card wrapper with children", () => {
      render(
        <Card className="test-card">
          <p>Card Content</p>
        </Card>,
      );

      expect(screen.getByText("Card Content")).toBeInTheDocument();
    });
  });

  describe("Fetch Utility Integration", () => {
    it("mockFetch intercepts requests and returns configured response", async () => {
      const testPayload = { message: "success", data: [1, 2, 3] };
      mockFetch(testPayload);

      const res = await fetch("/api/test");
      const data = await res.json();
      expect(data).toEqual(testPayload);
    });
  });
});
