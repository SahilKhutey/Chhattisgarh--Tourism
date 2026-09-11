import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { TemplateVersionsPage } from "../TemplateVersionsPage";
import * as api from "@/lib/api/template-versions";

jest.mock("@/lib/api/template-versions");

describe("TemplateVersionsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading state initially", () => {
    (api.getTemplateVersions as jest.Mock).mockReturnValue(
      new Promise(() => {}),
    );

    render(<TemplateVersionsPage templateId="tmpl-1" />);
    expect(screen.getByText("Loading versions...")).toBeInTheDocument();
  });

  it("renders empty state when no versions exist", async () => {
    (api.getTemplateVersions as jest.Mock).mockResolvedValue({
      items: [],
      total: 0,
    });

    render(<TemplateVersionsPage templateId="tmpl-1" />);

    await waitFor(() => {
      expect(
        screen.getByText("No versions have been published yet."),
      ).toBeInTheDocument();
    });
  });

  it("renders versions list when items exist", async () => {
    (api.getTemplateVersions as jest.Mock).mockResolvedValue({
      items: [
        {
          id: "ver-2",
          version_number: 2,
          schema_hash: "hash2",
          breaking_change: false,
          risk_summary: {},
          created_by: "user-1",
          created_at: "2026-09-11T12:00:00Z",
          is_published: true,
        },
        {
          id: "ver-1",
          version_number: 1,
          schema_hash: "hash1",
          breaking_change: false,
          risk_summary: {},
          created_by: "user-1",
          created_at: "2026-09-11T10:00:00Z",
          is_published: false,
        },
      ],
      total: 2,
    });

    render(<TemplateVersionsPage templateId="tmpl-1" />);

    await waitFor(() => {
      expect(screen.getByText("v2")).toBeInTheDocument();
      expect(screen.getByText("v1")).toBeInTheDocument();
      expect(screen.getByText("Published")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Rollback" })).toBeInTheDocument();
    });
  });

  it("renders error state on API failure", async () => {
    (api.getTemplateVersions as jest.Mock).mockRejectedValue(
      new Error("Network disconnect"),
    );

    render(<TemplateVersionsPage templateId="tmpl-1" />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText("Unable to load versions.")).toBeInTheDocument();
    });
  });
});
