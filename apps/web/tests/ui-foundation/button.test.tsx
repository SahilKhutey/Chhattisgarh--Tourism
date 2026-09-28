import { render, screen } from "@testing-library/react";
import { Button } from "@/ui/Button";

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Explore</Button>);

    expect(
      screen.getByRole("button", { name: "Explore" }),
    ).toBeInTheDocument();
  });

  it("supports loading state", () => {
    render(<Button loading>Explore</Button>);

    const button = screen.getByRole("button", { name: "Loading…" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });

  it("supports disabled state", () => {
    render(<Button disabled>Explore</Button>);

    expect(
      screen.getByRole("button", { name: "Explore" }),
    ).toBeDisabled();
  });

  it("renders with secondary variant", () => {
    render(<Button variant="secondary">Book Homestay</Button>);

    const button = screen.getByRole("button", { name: "Book Homestay" });
    expect(button).toHaveClass("bg-secondary");
  });

  it("renders with danger variant", () => {
    render(<Button variant="danger">Cancel Booking</Button>);

    const button = screen.getByRole("button", { name: "Cancel Booking" });
    expect(button).toHaveClass("bg-destructive");
  });
});
