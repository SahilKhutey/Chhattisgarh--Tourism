import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import GlossaryPage from "./page";
import * as glossaryApi from "@/lib/api/glossary";

jest.mock("@/lib/api/glossary");

describe("GlossaryPage", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    jest.clearAllMocks();
  });

  it("renders page heading and loads terms", async () => {
    (glossaryApi.getGlossary as jest.Mock).mockResolvedValue([
      {
        id: 1,
        key: "waterfall",
        definition: "A water drop",
        context: "Nature",
        preferred: true,
        deprecated: false,
        translations: [
          { locale_code: "en", term: "Waterfall", synonyms: [] },
          { locale_code: "hi", term: "जलप्रपात", synonyms: [] },
        ],
      },
    ]);

    render(
      <QueryClientProvider client={queryClient}>
        <GlossaryPage />
      </QueryClientProvider>,
    );

    expect(screen.getByRole("heading", { name: /glossary/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("waterfall")).toBeInTheDocument();
      expect(screen.getByText("Waterfall")).toBeInTheDocument();
      expect(screen.getByText("जलप्रपात")).toBeInTheDocument();
    });
  });

  it("renders error alert when api call fails", async () => {
    (glossaryApi.getGlossary as jest.Mock).mockRejectedValue(
      new Error("Failed to connect to database"),
    );

    render(
      <QueryClientProvider client={queryClient}>
        <GlossaryPage />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Failed to connect to database");
    });
  });
});
