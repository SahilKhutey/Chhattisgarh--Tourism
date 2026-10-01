import { render, screen } from "@testing-library/react";
import { Breadcrumbs } from "./Breadcrumbs";

describe("Breadcrumbs component", () => {
  it("renders accessible breadcrumb hierarchy", () => {
    const items = [
      { label: "Home", href: "/" },
      { label: "Destinations", href: "/destinations" },
      { label: "Bastar", href: "/destinations/bastar" },
      { label: "Chitrakote Falls" },
    ];

    render(<Breadcrumbs items={items} />);

    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Destinations" })).toHaveAttribute("href", "/destinations");
    expect(screen.getByRole("link", { name: "Bastar" })).toHaveAttribute("href", "/destinations/bastar");

    const currentItem = screen.getByText("Chitrakote Falls");
    expect(currentItem).toHaveAttribute("aria-current", "page");
  });

  it("returns null if items array is empty", () => {
    const { container } = render(<Breadcrumbs items={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
