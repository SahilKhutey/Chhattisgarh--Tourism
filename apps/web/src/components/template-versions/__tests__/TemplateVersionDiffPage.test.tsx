import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { TemplateVersionDiffPage } from "../TemplateVersionDiffPage";
import * as api from "@/lib/api/template-versions";

jest.mock("@/lib/api/template-versions");

describe("TemplateVersionDiffPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading state", () => {
    (api.getVersionDiff as jest.Mock).mockReturnValue(new Promise(() => {}));

    render(<TemplateVersionDiffPage templateId="tmpl-1" version={1} />);
    expect(screen.getByText("Loading diff...")).toBeInTheDocument();
  });

  it("renders first version message when no previous diff exists", async () => {
    (api.getVersionDiff as jest.Mock).mockResolvedValue({
      version: 1,
      against: null,
      diff: null,
    });

    render(<TemplateVersionDiffPage templateId="tmpl-1" version={1} />);

    await waitFor(() => {
      expect(screen.getByText("Version 1")).toBeInTheDocument();
      expect(
        screen.getByText("This is the first version. There is no previous version to compare."),
      ).toBeInTheDocument();
    });
  });

  it("renders diff statistics, alert, and sections", async () => {
    (api.getVersionDiff as jest.Mock).mockResolvedValue({
      version: 2,
      against: 1,
      breaking: true,
      added: [
        {
          key: "bio",
          change: "ADDED",
          breaking: true,
          after: {},
        },
      ],
      removed: [],
      changed: [
        {
          key: "name",
          change: "LABEL_CHANGED",
          breaking: false,
          before: "Old",
          after: "New",
        },
      ],
      reordered: [],
      metadata_changes: [],
      risk: {
        breaking: true,
        added: 1,
        removed: 0,
        changed: 1,
        reordered: 0,
        risk_level: "HIGH",
        actions: [{ type: "MANUAL_REVIEW", reason: "Breaking changes" }],
      },
      diff: true,
    });

    render(<TemplateVersionDiffPage templateId="tmpl-1" version={2} />);

    await waitFor(() => {
      expect(screen.getByText("Version 2 Diff")).toBeInTheDocument();
      expect(screen.getByText("Compared with version 1.")).toBeInTheDocument();
      expect(screen.getByRole("alert")).toHaveTextContent("Breaking changes detected.");
      expect(screen.getByText("Added fields")).toBeInTheDocument();
      expect(screen.getByText("Changed fields")).toBeInTheDocument();
      expect(screen.getByText("bio")).toBeInTheDocument();
      expect(screen.getByText("name")).toBeInTheDocument();
    });
  });
});
