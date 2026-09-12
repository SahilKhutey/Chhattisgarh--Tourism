import React from "react";
import { SearchIntent } from "@/types/intelligence";

interface IntentSuggestionsProps {
  intent: SearchIntent | null;
  suggestedQueries: string[];
  onSelectQuery: (query: string) => void;
  className?: string;
}

const INTENT_LABELS: Record<string, { label: string; bg: string; text: string }> = {
  nature: { label: "Nature & Retreats", bg: "bg-emerald-50", text: "text-emerald-750" },
  spiritual: { label: "Temples & Pilgrimage", bg: "bg-amber-50", text: "text-amber-750" },
  wildlife: { label: "Wildlife & Forests", bg: "bg-green-50", text: "text-green-750" },
  heritage: { label: "Heritage & History", bg: "bg-amber-50", text: "text-amber-800" },
  culture: { label: "Tribal Culture & Arts", bg: "bg-purple-50", text: "text-purple-750" },
  adventure: { label: "Trekking & Adventure", bg: "bg-orange-50", text: "text-orange-750" },
  waterfall: { label: "Cascades & Waterfalls", bg: "bg-cyan-50", text: "text-cyan-750" },
  crafts: { label: "Handicrafts & Bell Metal", bg: "bg-rose-50", text: "text-rose-750" },
};

export const IntentSuggestions: React.FC<IntentSuggestionsProps> = ({
  intent,
  suggestedQueries,
  onSelectQuery,
  className = "",
}) => {
  if (!suggestedQueries || suggestedQueries.length === 0) return null;

  const intentMeta = intent ? INTENT_LABELS[intent] : null;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex flex-wrap items-center gap-2">
        {intentMeta && (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${intentMeta.bg} ${intentMeta.text}`}
          >
            <span>Theme:</span> {intentMeta.label}
          </span>
        )}
        <span className="text-xs text-slate-500 font-medium">Explore related ideas:</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {suggestedQueries.map((query, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectQuery(query)}
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white text-slate-700 border border-slate-200 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50/30 transition shadow-sm"
          >
            <svg
              className="w-3 h-3 mr-1.5 text-slate-400"
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
            {query}
          </button>
        ))}
      </div>
    </div>
  );
};
