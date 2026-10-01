import { render } from "@testing-library/react";
import { Skeleton } from "../Skeleton";

describe("Skeleton component", () => {
  it("renders with aria-hidden='true' and pulse animation class", () => {
    const { container } = render(<Skeleton className="h-8 w-24" />);
    const skeleton = container.firstChild as HTMLElement;

    expect(skeleton).toHaveAttribute("aria-hidden", "true");
    expect(skeleton).toHaveClass("animate-pulse");
    expect(skeleton).toHaveClass("h-8");
    expect(skeleton).toHaveClass("w-24");
  });
});
