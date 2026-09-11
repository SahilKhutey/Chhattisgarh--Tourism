/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { TemplatePreview } from "../TemplatePreview";
import type { TemplateField } from "@/types/template";

describe("TemplatePreview Component", () => {
  it("renders empty message when no fields are present", () => {
    render(<TemplatePreview fields={[]} />);
    expect(screen.getByText("Content Preview")).toBeInTheDocument();
    expect(
      screen.getByText("No fields added yet. Add fields from the palette to preview."),
    ).toBeInTheDocument();
  });

  it("groups fields by group name and indicates required fields", () => {
    const fields: TemplateField[] = [
      {
        key: "title",
        label: "Destination Title",
        type: "TEXT",
        required: true,
        translatable: true,
        order: 0,
        group: "Basic Information",
        helpText: "Enter the main name",
        config: {},
      },
      {
        key: "is_active",
        label: "Open To Public",
        type: "BOOLEAN",
        required: false,
        translatable: false,
        order: 1,
        group: "Visitor Details",
        helpText: "Whether visitors are currently allowed",
        config: {},
      },
      {
        key: "category",
        label: "Attraction Category",
        type: "DROPDOWN",
        required: false,
        translatable: true,
        order: 2,
        group: null, // Should default to "General"
        helpText: null,
        config: {
          options: [{ value: "waterfall", label: "Waterfall" }],
        },
      },
    ];

    render(<TemplatePreview fields={fields} />);

    expect(screen.getByText("Basic Information")).toBeInTheDocument();
    expect(screen.getByText("Visitor Details")).toBeInTheDocument();
    expect(screen.getByText("General")).toBeInTheDocument();

    expect(screen.getByText("Destination Title")).toBeInTheDocument();
    expect(screen.getByText("Open To Public")).toBeInTheDocument();
    expect(screen.getByText("Attraction Category")).toBeInTheDocument();

    // Required indicator
    expect(screen.getByText("*")).toBeInTheDocument();

    // Options rendered inside select
    expect(screen.getByText("Waterfall")).toBeInTheDocument();
  });
});
