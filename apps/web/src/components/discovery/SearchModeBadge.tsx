import React from "react";

interface SearchModeBadgeProps {
  mode: "hybrid" | "lexical";
  semanticEnabled?: boolean;
  fallbackUsed?: boolean;
  className?: string;
}

export const SearchModeBadge: React.FC<SearchModeBadgeProps> = ({
  mode,
  semanticEnabled = true,
  fallbackUsed = false,
  className = "",
}) => {
  if (fallbackUsed) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-amber-50 text-amber-800 border border-amber-200 ${className}`}
        title="Semantic search encountered an issue; smoothly fell back to verified keyword search"
      >
        <svg
          className="w-3.5 h-3.5 text-amber-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        Keyword Search (Fallback)
      </span>
    );
  }

  if (mode === "hybrid" && semanticEnabled) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 ${className}`}
        title="AI concept understanding combined with exact keyword match"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        Hybrid Discovery (Semantic + Keyword)
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-750 border border-slate-200 ${className}`}
    >
      Exact Keyword Match
    </span>
  );
};
