import { render, screen, fireEvent } from "@testing-library/react";
import { IconButton } from "./IconButton";

describe("IconButton component", () => {
  it("renders with required label as accessible name", () => {
    render(
      <IconButton label="Bookmark destination">
        <svg data-testid="icon" />
      </IconButton>
    );

    const button = screen.getByRole("button", { name: "Bookmark destination" });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("title", "Bookmark destination");
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("handles click events", () => {
    const handleClick = jest.fn();
    render(<IconButton label="Close" onClick={handleClick} />);
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("disables and sets aria-busy during loading", () => {
    render(<IconButton label="Share" loading />);
    const button = screen.getByRole("button", { name: "Share" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });
});
