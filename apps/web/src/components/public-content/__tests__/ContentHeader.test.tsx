import React from "react";
import { render, screen } from "@testing-library/react";
import { ContentHeader } from "../ContentHeader";
import type { PublicContent } from "@/types/public-content";

const mockContent: PublicContent = {
  id: "test-id",
  slug: "chitrakote",
  template_id: "tpl-id",
  template_version: 1,
  locale: "en",
  name: "Chitrakote Falls",
  description: "The Niagara of India",
  canonical_url: "https://example.com/en/destinations/chitrakote",
  breadcrumbs: [
    { label: "Home", href: "/en" },
    { label: "Destinations", href: "/en/destinations" },
    { label: "Chitrakote Falls", href: "/en/destinations/chitrakote" },
  ],
  fields: [],
};

describe("ContentHeader", () => {
  it("renders H1 title, description, and breadcrumbs", () => {
    render(<ContentHeader content={mockContent} />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Chitrakote Falls" }),
    ).toBeInTheDocument();
    expect(screen.getByText("The Niagara of India")).toBeInTheDocument();

    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument();
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Destinations")).toBeInTheDocument();
  });
});
