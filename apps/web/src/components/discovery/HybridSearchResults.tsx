import React from "react";
import Link from "next/link";
import { HybridSearchItem } from "@/types/intelligence";
import { SearchModeBadge } from "./SearchModeBadge";

interface HybridSearchResultsProps {
  items: HybridSearchItem[];
  mode: "hybrid" | "lexical";
  semanticEnabled?: boolean;
  fallbackUsed?: boolean;
  total: number;
  locale?: string;
  className?: string;
}

export const HybridSearchResults: React.FC<HybridSearchResultsProps> = ({
  items,
  mode,
  semanticEnabled = true,
  fallbackUsed = false,
  total,
  locale = "en",
  className = "",
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-900">
            {total} {total === 1 ? "Result" : "Results"}
          </span>
          <SearchModeBadge
            mode={mode}
            semanticEnabled={semanticEnabled}
            fallbackUsed={fallbackUsed}
          />
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200">
          <svg
            className="w-12 h-12 mx-auto text-slate-400 mb-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-base font-medium text-slate-800">
            No tourism experiences matched your search
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try broader terms like &quot;waterfalls&quot;, &quot;temples in Bastar&quot;, or select one of the suggested themes above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/${locale}/destinations/${item.slug}`}
              className="group flex flex-col sm:flex-row bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-emerald-500/50 transition-all"
            >
              <div className="sm:w-44 h-40 sm:h-auto bg-slate-100 relative shrink-0 overflow-hidden">
                {item.thumbnail_url ? (
                  <img
                    src={item.thumbnail_url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                    <span className="text-xs uppercase font-medium tracking-wider">
                      {item.content_type}
                    </span>
                  </div>
                )}
                {item.district && (
                  <span className="absolute top-2 left-2 text-[10px] font-semibold bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded">
                    {item.district}
                  </span>
                )}
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">
                      {item.title}
                    </h3>
                  </div>

                  {item.description && (
                    <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50/80 px-2 py-0.5 rounded text-[11px] font-medium">
                    <svg
                      className="w-3 h-3 text-emerald-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {item.match_reason}
                  </span>

                  {item.semantic_score && item.semantic_score > 0 ? (
                    <span className="text-[11px] text-slate-400 font-mono">
                      relevance: {Math.round(item.hybrid_score * 100)}%
                    </span>
                  ) : null}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
