import React from "react";
import { render, screen } from "@testing-library/react";
import {
  AppLoadingScreen,
  PageLoading,
  SectionLoading,
  CardSkeleton,
  ListSkeleton,
  ContentSkeleton,
  MapLoading,
  SearchLoading,
  TripPlanningLoading,
} from "@/components/loading";

describe("Canonical Loading Components", () => {
  describe("AppLoadingScreen", () => {
    it("renders with accessible role, status, and custom label", () => {
      render(<AppLoadingScreen label="Bootstrapping CG Tourism" />);
      const status = screen.getByRole("status");
      expect(status).toBeInTheDocument();
      expect(status).toHaveAttribute("aria-label", "Bootstrapping CG Tourism");
      expect(screen.getByText("Bootstrapping CG Tourism")).toBeInTheDocument();
    });
  });

  describe("PageLoading", () => {
    it("renders page loading landmark with aria-busy and skeleton cards", () => {
      render(<PageLoading />);
      const main = screen.getByRole("main");
      expect(main).toHaveAttribute("aria-busy", "true");
      expect(main).toHaveAttribute("aria-label", "Loading page");
    });
  });

  describe("SectionLoading", () => {
    it("renders section with accessible busy state", () => {
      render(<SectionLoading title="Trending Corridors" count={3} />);
      const section = screen.getByRole("region", { name: "Trending Corridors" });
      expect(section).toBeInTheDocument();
      expect(section).toHaveAttribute("aria-busy", "true");
    });
  });

  describe("CardSkeleton & ListSkeleton", () => {
    it("marks decorative skeleton cards and lists as aria-hidden", () => {
      const { container: cardContainer } = render(<CardSkeleton />);
      expect(cardContainer.firstChild).toHaveAttribute("aria-hidden", "true");

      const { container: listContainer } = render(<ListSkeleton count={4} />);
      expect(listContainer.firstChild).toHaveAttribute("aria-hidden", "true");
      expect(listContainer.querySelectorAll(".flex.gap-4").length).toBe(4);
    });
  });

  describe("ContentSkeleton", () => {
    it("renders all template engine loading shapes without error", () => {
      const shapes = ["hero", "article", "card-grid", "list", "detail", "map", "mixed"] as const;
      shapes.forEach((shape) => {
        const { container } = render(<ContentSkeleton shape={shape} />);
        expect(container.firstChild).toBeInTheDocument();
      });
    });
  });

  describe("MapLoading", () => {
    it("renders dedicated map loading container with status and label", () => {
      render(<MapLoading label="Loading Bastar GIS Map…" />);
      const mapStatus = screen.getByRole("status");
      expect(mapStatus).toBeInTheDocument();
      expect(mapStatus).toHaveAttribute("aria-label", "Loading Bastar GIS Map…");
      expect(screen.getByText("Loading Bastar GIS Map…")).toBeInTheDocument();
    });
  });

  describe("SearchLoading", () => {
    it("renders polite progress indicator when active", () => {
      render(<SearchLoading isFetching={true} label="Fetching tribal crafts…" />);
      const status = screen.getByRole("status");
      expect(status).toHaveAttribute("aria-busy", "true");
      expect(screen.getByText("Fetching tribal crafts…")).toBeInTheDocument();
    });

    it("returns null when not fetching to preserve layout stability", () => {
      const { container } = render(<SearchLoading isFetching={false} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe("TripPlanningLoading", () => {
    it("renders progressive stages without fabricated percentages", () => {
      render(
        <TripPlanningLoading
          currentStage="Checking routes"
          stageIndex={2}
        />
      );
      expect(screen.getByRole("status")).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: "Checking routes" })).toBeInTheDocument();
      expect(screen.getByText("Building itinerary")).toBeInTheDocument();
    });

    it("renders retry and cancel actions when operation exceeds threshold", () => {
      const onRetry = jest.fn();
      const onCancel = jest.fn();
      render(
        <TripPlanningLoading
          isLongRunning={true}
          onRetry={onRetry}
          onCancel={onCancel}
        />
      );
      expect(screen.getByText("Retry")).toBeInTheDocument();
      expect(screen.getByText("Cancel")).toBeInTheDocument();
    });
  });
});
