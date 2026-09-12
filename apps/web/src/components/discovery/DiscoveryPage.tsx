"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  DiscoveryResponse,
  HybridSearchItem,
  HybridSearchResponse,
  SearchIntent,
} from "@/types/intelligence";
import { SemanticSearch } from "./SemanticSearch";
import { HybridSearchResults } from "./HybridSearchResults";
import { RecommendationSection } from "./RecommendationSection";
import { fetchHybridSearch, fetchDiscovery } from "@/lib/api/intelligence";

interface DiscoveryPageProps {
  initialData: DiscoveryResponse;
  locale: string;
}

export const DiscoveryPage: React.FC<DiscoveryPageProps> = ({
  initialData,
  locale,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [mode, setMode] = useState<"hybrid" | "lexical">(
    (searchParams.get("mode") as "hybrid" | "lexical") || "hybrid"
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams.get("category") || null
  );
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(
    searchParams.get("district") || null
  );

  const [items, setItems] = useState<HybridSearchItem[]>(initialData.results);
  const [total, setTotal] = useState<number>(initialData.results.length);
  const [intent, setIntent] = useState<SearchIntent | null>(initialData.intent);
  const [suggestedQueries, setSuggestedQueries] = useState<string[]>(
    initialData.suggested_queries
  );
  const [fallbackUsed, setFallbackUsed] = useState<boolean>(false);
  const [semanticEnabled, setSemanticEnabled] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const performSearch = async (
    newQuery: string,
    newMode: "hybrid" | "lexical",
    categoryFilter = selectedCategory,
    districtFilter = selectedDistrict
  ) => {
    setIsLoading(true);
    try {
      if (!newQuery.trim() && !categoryFilter && !districtFilter) {
        // Reset to initial discovery state
        const discovery = await fetchDiscovery({ locale });
        setItems(discovery.results);
        setTotal(discovery.results.length);
        setIntent(discovery.intent);
        setSuggestedQueries(discovery.suggested_queries);
        setFallbackUsed(false);
        setSemanticEnabled(true);
      } else {
        const response: HybridSearchResponse = await fetchHybridSearch({
          query: newQuery,
          locale,
          mode: newMode,
          category: categoryFilter || undefined,
          district: districtFilter || undefined,
        });
        setItems(response.items);
        setTotal(response.total);
        setIntent(response.intent);
        setFallbackUsed(response.fallback_used);
        setSemanticEnabled(response.semantic_enabled);
      }

      // Update URL search parameters without full page reload
      const nextParams = new URLSearchParams();
      if (newQuery) nextParams.set("q", newQuery);
      if (newMode !== "hybrid") nextParams.set("mode", newMode);
      if (categoryFilter) nextParams.set("category", categoryFilter);
      if (districtFilter) nextParams.set("district", districtFilter);
      router.replace(`/${locale}/discover?${nextParams.toString()}`, {
        scroll: false,
      });
    } catch (err) {
      console.error("Discovery search error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (searchQuery: string, searchMode: "hybrid" | "lexical") => {
    setQuery(searchQuery);
    setMode(searchMode);
    performSearch(searchQuery, searchMode);
  };

  const handleCategoryClick = (cat: string) => {
    const next = selectedCategory === cat ? null : cat;
    setSelectedCategory(next);
    performSearch(query, mode, next, selectedDistrict);
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Hero Search Section */}
      <div className="bg-gradient-to-b from-emerald-900 to-emerald-950 text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-800/80 text-emerald-200 border border-emerald-700/50 mb-4">
            ✨ Intelligent Discovery Engine
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Discover the Heart of India
          </h1>
          <p className="mt-3 text-base sm:text-lg text-emerald-100/90 max-w-2xl mx-auto">
            Search naturally by concepts, feelings, traditions, or exact destinations across Chhattisgarh.
          </p>

          <div className="mt-8 text-left">
            <SemanticSearch
              initialQuery={query}
              initialMode={mode}
              detectedIntent={intent}
              suggestedQueries={suggestedQueries}
              onSearch={handleSearchSubmit}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Pills */}
        <div className="mb-8">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
            Popular Tourism Themes
          </h3>
          <div className="flex flex-wrap gap-2">
            {initialData.related_categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategoryClick(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                    isSelected
                      ? "bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/20"
                      : "bg-white text-slate-700 border border-slate-200 hover:border-emerald-500 hover:text-emerald-700"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Results */}
        <HybridSearchResults
          items={items}
          mode={mode}
          semanticEnabled={semanticEnabled}
          fallbackUsed={fallbackUsed}
          total={total}
          locale={locale}
        />

        {/* Curated Recommendations */}
        {initialData.recommendations.length > 0 && (
          <div className="mt-12 pt-8 border-t border-slate-200">
            <RecommendationSection
              title="Featured & Contextual Recommendations"
              subtitle="Places selected for their cultural, historical, and geographical significance"
              recommendations={initialData.recommendations}
              locale={locale}
            />
          </div>
        )}
      </div>
    </div>
  );
};
