import React from "react";
import { render, screen } from "@testing-library/react";
import { ContentRenderer } from "../ContentRenderer";
import type { PublicContent } from "@/types/public-content";

const mockContent: PublicContent = {
  id: "test-id",
  slug: "barnawapara",
  template_id: "tpl-id",
  template_version: 1,
  locale: "en",
  name: "Barnawapara Sanctuary",
  description: "A wildlife sanctuary in CG",
  canonical_url: "https://example.com/en/destinations/barnawapara",
  breadcrumbs: [],
  fields: [
    {
      key: "overview",
      label: "Overview",
      type: "TEXT",
      value: "Lush green landscape.",
      group: "General Information",
    },
    {
      key: "wildlife",
      label: "Wildlife Sightings",
      type: "RICHTEXT",
      value: "<p>Leopards, deer, and flying squirrels.</p>",
      group: "Nature",
    },
    {
      key: "rating",
      label: "Rating",
      type: "NUMBER",
      value: 4.8,
      group: "General Information",
    },
    {
      key: "is_open",
      label: "Open Today",
      type: "BOOLEAN",
      value: true,
      group: "General Information",
    },
  ],
};

describe("ContentRenderer", () => {
  it("renders grouped sections and field labels dynamically", () => {
    render(<ContentRenderer content={mockContent} />);

    expect(screen.getByText("General Information")).toBeInTheDocument();
    expect(screen.getByText("Nature")).toBeInTheDocument();

    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("Lush green landscape.")).toBeInTheDocument();

    expect(screen.getByText("Wildlife Sightings")).toBeInTheDocument();
    expect(screen.getByText(/Leopards, deer, and flying squirrels/)).toBeInTheDocument();

    expect(screen.getByText("4.8")).toBeInTheDocument();
    expect(screen.getByText("Yes")).toBeInTheDocument();
  });
});
