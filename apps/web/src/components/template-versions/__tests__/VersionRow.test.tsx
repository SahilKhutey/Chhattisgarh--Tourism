import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { VersionRow } from "../VersionRow";
import * as api from "@/lib/api/template-versions";
import type { TemplateVersionListItem } from "@/types/template-version";

jest.mock("@/lib/api/template-versions");

const mockVersion: TemplateVersionListItem = {
  id: "ver-1",
  version_number: 1,
  schema_hash: "hash123",
  breaking_change: true,
  risk_summary: {
    risk_level: "HIGH",
    added: 1,
    removed: 0,
    changed: 0,
    reordered: 0,
  },
  created_by: "user-1",
  created_at: "2026-09-11T10:00:00Z",
  is_published: false,
};

describe("VersionRow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders version number, badges, and view diff link", () => {
    render(
      <VersionRow
        templateId="tmpl-1"
        version={mockVersion}
        onRollback={jest.fn()}
      />,
    );

    expect(screen.getByText("v1")).toBeInTheDocument();
    expect(screen.getByText("Breaking")).toBeInTheDocument();
    const diffLink = screen.getByRole("link", { name: "View diff" });
    expect(diffLink).toHaveAttribute(
      "href",
      "/admin/templates/tmpl-1/versions/1/diff",
    );
  });

  it("renders Published badge and hides rollback button when published", () => {
    const publishedVersion = { ...mockVersion, is_published: true };
    render(
      <VersionRow
        templateId="tmpl-1"
        version={publishedVersion}
        onRollback={jest.fn()}
      />,
    );

    expect(screen.getByText("Published")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Rollback" }),
    ).not.toBeInTheDocument();
  });

  it("prompts confirmation and calls rollbackTemplate", async () => {
    jest.spyOn(window, "confirm").mockReturnValue(true);
    (api.rollbackTemplate as jest.Mock).mockResolvedValue({
      id: "ver-1",
      version_number: 1,
    });
    const onRollback = jest.fn();

    render(
      <VersionRow
        templateId="tmpl-1"
        version={mockVersion}
        onRollback={onRollback}
      />,
    );

    const rollbackButton = screen.getByRole("button", { name: "Rollback" });
    fireEvent.click(rollbackButton);

    expect(window.confirm).toHaveBeenCalledWith("Rollback to version 1?");
    await waitFor(() => {
      expect(api.rollbackTemplate).toHaveBeenCalledWith("tmpl-1", 1);
      expect(onRollback).toHaveBeenCalled();
    });
  });

  it("does not call rollback when confirmation is cancelled", () => {
    jest.spyOn(window, "confirm").mockReturnValue(false);
    const onRollback = jest.fn();

    render(
      <VersionRow
        templateId="tmpl-1"
        version={mockVersion}
        onRollback={onRollback}
      />,
    );

    const rollbackButton = screen.getByRole("button", { name: "Rollback" });
    fireEvent.click(rollbackButton);

    expect(api.rollbackTemplate).not.toHaveBeenCalled();
    expect(onRollback).not.toHaveBeenCalled();
  });
});
