import { render, screen } from "@testing-library/react";
import { SlideIn } from "../SlideIn";

describe("SlideIn component", () => {
  it("renders with default slide-up class", () => {
    render(<SlideIn>Chitrakote Falls</SlideIn>);
    const el = screen.getByText("Chitrakote Falls");
    expect(el).toHaveClass("cg-motion-slide-up");
  });

  it("applies directional slide classes", () => {
    const { rerender } = render(<SlideIn direction="left">Mainpat</SlideIn>);
    expect(screen.getByText("Mainpat")).toHaveClass("cg-motion-slide-left");

    rerender(<SlideIn direction="right">Tirathgarh</SlideIn>);
    expect(screen.getByText("Tirathgarh")).toHaveClass("cg-motion-slide-right");

    rerender(<SlideIn direction="down">Kanger Valley</SlideIn>);
    expect(screen.getByText("Kanger Valley")).toHaveClass("cg-motion-slide-down");
  });
});
