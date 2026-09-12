/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { SearchModeBadge } from "@/components/discovery/SearchModeBadge";
import { RecommendationReason } from "@/components/discovery/RecommendationReason";
import { IntentSuggestions } from "@/components/discovery/IntentSuggestions";
import { SimilarContent } from "@/components/discovery/SimilarContent";
import { PublicContextPanel } from "@/components/discovery/PublicContextPanel";
import { HybridSearchItem, PublicContextResponse } from "@/types/intelligence";

describe("P12 Discovery & Intelligence Components Suite", () => {
  describe("SearchModeBadge", () => {
    it("renders hybrid badge when hybrid mode is active", () => {
      render(<SearchModeBadge mode="hybrid" semanticEnabled={true} fallbackUsed={false} />);
      expect(screen.getByText(/Hybrid Discovery/i)).toBeInTheDocument();
    });

    it("renders fallback badge when fallbackUsed is true", () => {
      render(<SearchModeBadge mode="hybrid" semanticEnabled={false} fallbackUsed={true} />);
      expect(screen.getByText(/Keyword Search \(Fallback\)/i)).toBeInTheDocument();
    });

    it("renders exact keyword badge in lexical mode", () => {
      render(<SearchModeBadge mode="lexical" />);
      expect(screen.getByText(/Exact Keyword Match/i)).toBeInTheDocument();
    });
  });

  describe("RecommendationReason", () => {
    it("renders recommendation reason text", () => {
      render(<RecommendationReason reason="Popular in Bastar region" />);
      expect(screen.getByText("Popular in Bastar region")).toBeInTheDocument();
    });

    it("renders nearby reason text", () => {
      render(<RecommendationReason reason="Nearby within 25 km" />);
      expect(screen.getByText("Nearby within 25 km")).toBeInTheDocument();
    });
  });

  describe("IntentSuggestions", () => {
    it("renders theme label and suggested query pills", () => {
      const handleSelect = jest.fn();
      render(
        <IntentSuggestions
          intent="nature"
          suggestedQueries={["waterfalls in Bastar", "scenic valley drives"]}
          onSelectQuery={handleSelect}
        />
      );

      expect(screen.getByText("Nature & Retreats")).toBeInTheDocument();
      const pill = screen.getByRole("button", { name: /waterfalls in Bastar/i });
      expect(pill).toBeInTheDocument();

      fireEvent.click(pill);
      expect(handleSelect).toHaveBeenCalledWith("waterfalls in Bastar");
    });

    it("renders nothing when suggestedQueries is empty", () => {
      const { container } = render(
        <IntentSuggestions
          intent={null}
          suggestedQueries={[]}
          onSelectQuery={jest.fn()}
        />
      );
      expect(container.firstChild).toBeNull();
    });
  });

  describe("SimilarContent", () => {
    const mockItems: HybridSearchItem[] = [
      {
        id: "entry-1",
        slug: "tirathgarh-waterfall",
        title: "Tirathgarh Waterfall",
        content_type: "WATERFALL",
        district: "Bastar",
        categories: ["Waterfalls", "Nature"],
        tags: ["nature"],
        description: "Spectacular tiered waterfalls",
        thumbnail_url: null,
        latitude: 18.9,
        longitude: 81.8,
        score: 0.9,
        lexical_score: null,
        semantic_score: 0.88,
        hybrid_score: 0.9,
        match_reason: "Similar experience to Chitrakote Waterfall",
      },
    ];

    it("renders similar content cards and match reasons", () => {
      render(
        <SimilarContent
          items={mockItems}
          currentTitle="Chitrakote Waterfall"
          locale="en"
        />
      );

      expect(screen.getByText("Similar Experiences")).toBeInTheDocument();
      expect(screen.getByText("Tirathgarh Waterfall")).toBeInTheDocument();
      expect(screen.getByText(/88% match/i)).toBeInTheDocument();
    });
  });

  describe("PublicContextPanel", () => {
    const mockContext: PublicContextResponse = {
      entity: { id: "1", entity_type: "DESTINATION", name: "Chitrakote", slug: "chitrakote" },
      located_in: { id: "2", entity_type: "DISTRICT", name: "Bastar", slug: "bastar" },
      categories: [{ id: "3", entity_type: "CATEGORY", name: "Waterfalls", slug: "waterfalls" }],
      activities: [{ id: "4", entity_type: "ACTIVITY", name: "Boating", slug: "boating" }],
      nearby: [{ id: "5", entity_type: "DESTINATION", name: "Tirathgarh", slug: "tirathgarh" }],
    };

    it("renders knowledge graph links and categories", () => {
      render(<PublicContextPanel context={mockContext} locale="en" />);

      expect(screen.getByText(/Tourism Knowledge & Exploration Network/i)).toBeInTheDocument();
      expect(screen.getByText("Bastar District")).toBeInTheDocument();
      expect(screen.getByText("Waterfalls")).toBeInTheDocument();
      expect(screen.getByText("Boating")).toBeInTheDocument();
      expect(screen.getByText("• Tirathgarh")).toBeInTheDocument();
    });
  });
});
