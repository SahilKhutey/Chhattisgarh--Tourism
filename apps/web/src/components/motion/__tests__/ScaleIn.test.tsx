import { render, screen } from "@testing-library/react";
import { ScaleIn } from "../ScaleIn";

describe("ScaleIn component", () => {
  it("renders with cg-motion-scale-in class", () => {
    render(<ScaleIn>Sirpur Heritage</ScaleIn>);
    const el = screen.getByText("Sirpur Heritage");
    expect(el).toHaveClass("cg-motion-scale-in");
  });
});
