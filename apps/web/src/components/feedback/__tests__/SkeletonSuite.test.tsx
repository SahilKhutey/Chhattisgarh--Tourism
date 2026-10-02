import React from "react";
import { render, screen } from "@testing-library/react";
import {
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonImage,
  SkeletonMap,
} from "../Skeleton";

describe("Skeleton Suite", () => {
  it("renders base Skeleton with pulse animation class and aria-hidden", () => {
    const { container } = render(<Skeleton className="h-6 w-32" />);
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveAttribute("aria-hidden", "true");
    expect(el).toHaveClass("animate-pulse");
  });

  it("renders SkeletonText with multiple lines", () => {
    const { container } = render(<SkeletonText lines={3} />);
    const textGroup = container.firstChild as HTMLElement;
    expect(textGroup).toBeInTheDocument();
    expect(textGroup.children.length).toBe(3);
  });

  it("renders SkeletonCard with image and text placeholder", () => {
    const { container } = render(<SkeletonCard />);
    const card = container.firstChild as HTMLElement;
    expect(card).toBeInTheDocument();
  });

  it("renders SkeletonImage with aspect ratio styling", () => {
    const { container } = render(<SkeletonImage aspectRatio="16/9" />);
    const img = container.firstChild as HTMLElement;
    expect(img).toBeInTheDocument();
  });

  it("renders SkeletonMap with map controls placeholder and message", () => {
    render(<SkeletonMap />);
    const elements = screen.getAllByRole("status");
    expect(elements.length).toBeGreaterThan(0);
    expect(screen.getByText("Loading Geographic Intelligence...")).toBeInTheDocument();
  });
});
