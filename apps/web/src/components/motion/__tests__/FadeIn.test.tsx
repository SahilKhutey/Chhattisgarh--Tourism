import { render, screen } from "@testing-library/react";
import { FadeIn } from "../FadeIn";

describe("FadeIn component", () => {
  it("renders children and applies motion class", () => {
    render(
      <FadeIn>
        <p>Bastar Tribal Trail</p>
      </FadeIn>
    );

    const text = screen.getByText("Bastar Tribal Trail");
    expect(text).toBeInTheDocument();
    expect(text.parentElement).toHaveClass("cg-motion-fade-in");
  });
});
