import React from "react";
import { render, screen } from "@testing-library/react";
import {
  PageTransition,
  RouteTransition,
  ContentTransition,
} from "@/components/transitions";

describe("Transition Primitives", () => {
  describe("PageTransition", () => {
    it("renders children with cg-page-transition animation class", () => {
      render(
        <PageTransition>
          <h1>Discover Chhattisgarh</h1>
        </PageTransition>,
      );

      const heading = screen.getByRole("heading", {
        name: "Discover Chhattisgarh",
      });
      expect(heading).toBeInTheDocument();
      expect(heading.parentElement).toHaveClass("cg-page-transition");
    });
  });

  describe("RouteTransition", () => {
    it("renders continuity container with navigation busy state", () => {
      const { rerender } = render(
        <RouteTransition isNavigating={false}>
          <p>Main Route</p>
        </RouteTransition>,
      );

      expect(screen.getByText("Main Route")).toBeInTheDocument();
      expect(screen.getByText("Main Route").parentElement).toHaveAttribute("aria-busy", "false");

      rerender(
        <RouteTransition isNavigating={true}>
          <p>Main Route</p>
        </RouteTransition>,
      );
      expect(screen.getByText("Main Route").parentElement).toHaveAttribute("aria-busy", "true");
      expect(screen.getByText("Main Route").parentElement).toHaveClass("cg-route-navigating");
    });
  });

  describe("ContentTransition", () => {
    it("applies slide-up and fade transition variants", () => {
      const { container: slideContainer } = render(
        <ContentTransition type="slide-up">
          <div>Slide Content</div>
        </ContentTransition>,
      );
      expect(slideContainer.firstChild).toHaveClass("cg-content-transition");
      expect(slideContainer.firstChild).toHaveClass("cg-transition-slide-up");

      const { container: fadeContainer } = render(
        <ContentTransition type="fade">
          <div>Fade Content</div>
        </ContentTransition>,
      );
      expect(fadeContainer.firstChild).toHaveClass("cg-transition-fade");
    });
  });
});
