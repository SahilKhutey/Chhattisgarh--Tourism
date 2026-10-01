import { render, screen } from "@testing-library/react";
import { Badge } from "./Badge";

describe("Badge component", () => {
  it("renders badge content and defaults", () => {
    render(<Badge>Tribal Art</Badge>);
    expect(screen.getByText("Tribal Art")).toBeInTheDocument();
  });

  it("applies variant classes correctly", () => {
    const { rerender } = render(<Badge variant="success">Verified</Badge>);
    expect(screen.getByText("Verified")).toHaveClass("bg-emerald-700");

    rerender(<Badge variant="warning">Seasonal</Badge>);
    expect(screen.getByText("Seasonal")).toHaveClass("bg-amber-600");

    rerender(<Badge variant="danger">High Alert</Badge>);
    expect(screen.getByText("High Alert")).toHaveClass("bg-red-700");
  });
});
