import { render, screen } from "@testing-library/react";
import { NavigationLink } from "./NavigationLink";

let mockPathname = "/destinations";

jest.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

describe("NavigationLink component", () => {
  it("renders active link with aria-current='page'", () => {
    mockPathname = "/destinations";
    render(<NavigationLink href="/destinations">Destinations</NavigationLink>);

    const link = screen.getByRole("link", { name: "Destinations" });
    expect(link).toHaveAttribute("aria-current", "page");
    expect(link).toHaveClass("text-primary");
  });

  it("renders inactive link without aria-current='page'", () => {
    mockPathname = "/planner";
    render(<NavigationLink href="/destinations">Destinations</NavigationLink>);

    const link = screen.getByRole("link", { name: "Destinations" });
    expect(link).not.toHaveAttribute("aria-current");
    expect(link).toHaveClass("text-muted-foreground");
  });
});
