/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { TemplateBuilderPage } from "../TemplateBuilderPage";
import * as api from "@/lib/api/templates";

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock("@/lib/api/templates", () => ({
  getTemplate: jest.fn(),
  updateTemplate: jest.fn(),
  updateTemplateFields: jest.fn(),
  validateTemplate: jest.fn(),
  publishTemplate: jest.fn(),
}));

describe("TemplateBuilderPage Component", () => {
  const mockDraftTemplate = {
    id: "tpl-456",
    name: "Bastar Crafts",
    slug: "bastar-crafts",
    description: "Handicrafts of Bastar",
    icon: "palette",
    category: "craft",
    status: "DRAFT" as const,
    fields: [
      {
        key: "artisan_name",
        label: "Artisan Name",
        type: "TEXT" as const,
        required: true,
        translatable: true,
        order: 0,
        group: "Basic Info",
        helpText: "Name of the master artisan",
        config: {},
      },
    ],
    updated_at: "2026-01-01T00:00:00Z",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading state initially", () => {
    (api.getTemplate as jest.Mock).mockReturnValue(new Promise(() => {}));
    render(<TemplateBuilderPage templateId="tpl-456" />);
    expect(screen.getByText("Loading template builder...")).toBeInTheDocument();
  });

  it("renders error state when fetch fails", async () => {
    (api.getTemplate as jest.Mock).mockRejectedValueOnce(
      new Error("Database connection error"),
    );

    render(<TemplateBuilderPage templateId="tpl-456" />);

    expect(
      await screen.findByText("Unable to load template."),
    ).toBeInTheDocument();
    expect(screen.getByText("Database connection error")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
  });

  it("renders builder UI with metadata, palette, canvas, and preview", async () => {
    (api.getTemplate as jest.Mock).mockResolvedValueOnce(mockDraftTemplate);

    render(<TemplateBuilderPage templateId="tpl-456" />);

    expect(
      await screen.findByRole("heading", { name: "Bastar Crafts" }),
    ).toBeInTheDocument();
    expect(screen.getByText("/bastar-crafts")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /validate/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /publish/i })).toBeInTheDocument();

    // Palette is visible
    expect(screen.getByLabelText("Template field palette")).toBeInTheDocument();

    // Canvas contains Artisan Name
    expect(
      screen.getByRole("heading", { name: "Artisan Name" }),
    ).toBeInTheDocument();
  });

  it("saves changes and displays saved message", async () => {
    (api.getTemplate as jest.Mock).mockResolvedValueOnce(mockDraftTemplate);
    (api.updateTemplate as jest.Mock).mockResolvedValueOnce(mockDraftTemplate);
    (api.updateTemplateFields as jest.Mock).mockResolvedValueOnce(mockDraftTemplate);

    render(<TemplateBuilderPage templateId="tpl-456" />);

    expect(
      await screen.findByRole("heading", { name: "Bastar Crafts" }),
    ).toBeInTheDocument();

    const saveBtn = screen.getByRole("button", { name: /save/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(api.updateTemplate).toHaveBeenCalledWith("tpl-456", {
        name: "Bastar Crafts",
        slug: "bastar-crafts",
        description: "Handicrafts of Bastar",
        icon: "palette",
        category: "craft",
      });
      expect(api.updateTemplateFields).toHaveBeenCalledWith(
        "tpl-456",
        mockDraftTemplate.fields,
      );
      expect(screen.getByText("Saved successfully.")).toBeInTheDocument();
    });
  });

  it("disables modification controls when template is PUBLISHED", async () => {
    const publishedTemplate = {
      ...mockDraftTemplate,
      status: "PUBLISHED" as const,
    };
    (api.getTemplate as jest.Mock).mockResolvedValueOnce(publishedTemplate);

    render(<TemplateBuilderPage templateId="tpl-456" />);

    expect(await screen.findByText("PUBLISHED")).toBeInTheDocument();

    // Palette should not be rendered
    expect(screen.queryByLabelText("Template field palette")).toBeNull();

    // Save, Validate, Publish buttons are disabled
    expect(screen.getByRole("button", { name: /save/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /validate/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /publish/i })).toBeDisabled();
  });
});
