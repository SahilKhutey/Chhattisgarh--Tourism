import React from "react";
import { render, screen } from "@testing-library/react";
import { AppShell } from "../AppShell/AppShell";

describe("AppShell", () => {
  it("renders the main content region with accessible landmark", () => {
    render(
      <AppShell>
        <h1>Discover Chhattisgarh</h1>
      </AppShell>,
    );

    const main = screen.getByRole("main");
    expect(main).toBeInTheDocument();
    expect(main).toHaveAttribute("id", "main-content");
    expect(screen.getByRole("heading", { name: "Discover Chhattisgarh" })).toBeInTheDocument();
  });

  it("renders skip to content link for keyboard accessibility", () => {
    render(
      <AppShell>
        <p>Page Content</p>
      </AppShell>,
    );

    const skipLink = screen.getByRole("link", { name: "Skip to main content" });
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute("href", "#main-content");
  });

  it("renders header, footer, and bottom navigation", () => {
    render(
      <AppShell>
        <p>Content</p>
      </AppShell>,
    );

    expect(screen.getAllByRole("banner").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Mobile bottom navigation" })).toBeInTheDocument();
  });
});
