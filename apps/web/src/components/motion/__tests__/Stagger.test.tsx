import { render, screen } from "@testing-library/react";
import { Stagger } from "../Stagger";

describe("Stagger component", () => {
  it("renders container with cg-stagger class", () => {
    render(
      <Stagger>
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 3</div>
      </Stagger>
    );

    const item1 = screen.getByText("Item 1");
    expect(item1.parentElement).toHaveClass("cg-stagger");
  });
});
