import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AccessibilityPage from "./page";
import * as accessibilityApi from "@/lib/api/accessibility";

jest.mock("@/lib/api/accessibility");

describe("AccessibilityPage", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    jest.clearAllMocks();
  });

  it("renders summary statistics and audit records", async () => {
    (accessibilityApi.getAccessibilityAudit as jest.Mock).mockResolvedValue({
      total: 12,
      blockers: 0,
      average_score: 95.5,
      items: [
        {
          id: 1,
          content_entry_id: "entry-12345",
          locale_code: "en",
          score: 100,
          status: "PASS",
          created_at: new Date().toISOString(),
          issue_count: 0,
        },
      ],
    });

    render(
      <QueryClientProvider client={queryClient}>
        <AccessibilityPage />
      </QueryClientProvider>,
    );

    expect(screen.getByRole("heading", { name: "Accessibility" })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("12")).toBeInTheDocument();
      expect(screen.getByText("0")).toBeInTheDocument();
      expect(screen.getByText("95.5%")).toBeInTheDocument();
      expect(screen.getByText("entry-12345")).toBeInTheDocument();
      expect(screen.getByText("PASS")).toBeInTheDocument();
    });
  });

  it("renders error state when api fails", async () => {
    (accessibilityApi.getAccessibilityAudit as jest.Mock).mockRejectedValue(
      new Error("Accessibility service unavailable"),
    );

    render(
      <QueryClientProvider client={queryClient}>
        <AccessibilityPage />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Accessibility service unavailable");
    });
  });
});
