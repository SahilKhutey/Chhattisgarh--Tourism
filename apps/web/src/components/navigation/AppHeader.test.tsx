import { render, screen, fireEvent } from "@testing-library/react";
import { AppHeader } from "./AppHeader";

jest.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

describe("AppHeader component", () => {
  it("renders branding and header elements", () => {
    render(<AppHeader />);

    expect(screen.getByLabelText("Chhattisgarh Tourism Home")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Desktop Navigation" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Plan Trip" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /SOS \/ Safety/i })).toBeInTheDocument();
  });

  it("toggles mobile navigation drawer on menu button click", () => {
    render(<AppHeader />);

    const menuToggle = screen.getByRole("button", { name: "Open navigation menu" });
    expect(menuToggle).toHaveAttribute("aria-expanded", "false");

    // Click to open
    fireEvent.click(menuToggle);
    expect(screen.getByRole("dialog", { name: "Mobile Navigation Menu" })).toBeInTheDocument();
    expect(menuToggle).toHaveAttribute("aria-expanded", "true");

    // Click close inside drawer
    const closeBtn = screen.getByRole("button", { name: "Close menu" });
    fireEvent.click(closeBtn);
    expect(screen.queryByRole("dialog", { name: "Mobile Navigation Menu" })).not.toBeInTheDocument();
  });
});
