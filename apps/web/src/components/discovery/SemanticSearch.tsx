"use client";

import React, { useState } from "react";
import { SearchIntent } from "@/types/intelligence";
import { IntentSuggestions } from "./IntentSuggestions";

interface SemanticSearchProps {
  initialQuery?: string;
  initialMode?: "hybrid" | "lexical";
  detectedIntent?: SearchIntent | null;
  suggestedQueries?: string[];
  onSearch: (query: string, mode: "hybrid" | "lexical") => void;
  isLoading?: boolean;
  className?: string;
}

export const SemanticSearch: React.FC<SemanticSearchProps> = ({
  initialQuery = "",
  initialMode = "hybrid",
  detectedIntent = null,
  suggestedQueries = [],
  onSearch,
  isLoading = false,
  className = "",
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [mode, setMode] = useState<"hybrid" | "lexical">(initialMode);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query.trim(), mode);
  };

  const handleSelectSuggested = (suggested: string) => {
    setQuery(suggested);
    onSearch(suggested, mode);
  };

  const handleToggleMode = (newMode: "hybrid" | "lexical") => {
    setMode(newMode);
    if (query.trim()) {
      onSearch(query.trim(), newMode);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search experiences, moods, themes (e.g. 'peaceful waterfalls in Bastar', 'ancient Shiva temples')..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm transition"
            />
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <svg
                className="w-5 h-5 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  onSearch("", mode);
                }}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Mode Selector */}
            <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1 shrink-0">
              <button
                type="button"
                onClick={() => handleToggleMode("hybrid")}
                className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                  mode === "hybrid"
                    ? "bg-white text-emerald-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="AI Concept Understanding + Exact Match"
              >
                ✨ Hybrid AI
              </button>
              <button
                type="button"
                onClick={() => handleToggleMode("lexical")}
                className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                  mode === "lexical"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="Keyword Match Only"
              >
                Exact Match
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm transition flex items-center gap-2 shrink-0 disabled:opacity-75"
            >
              {isLoading ? (
                <svg
                  className="animate-spin -ml-1 mr-1 h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : null}
              Search
            </button>
          </div>
        </div>
      </form>

      {/* Concept Theme & Suggested Query Pills */}
      <IntentSuggestions
        intent={detectedIntent}
        suggestedQueries={suggestedQueries}
        onSelectQuery={handleSelectSuggested}
      />
    </div>
  );
};
