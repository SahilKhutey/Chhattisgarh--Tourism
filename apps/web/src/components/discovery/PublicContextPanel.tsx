import React from "react";
import Link from "next/link";
import { PublicContextResponse } from "@/types/intelligence";

interface PublicContextPanelProps {
  context: PublicContextResponse | null;
  locale?: string;
  className?: string;
}

export const PublicContextPanel: React.FC<PublicContextPanelProps> = ({
  context,
  locale = "en",
  className = "",
}) => {
  if (!context) return null;

  const hasContent =
    context.located_in ||
    context.categories.length > 0 ||
    context.activities.length > 0 ||
    context.nearby.length > 0;

  if (!hasContent) return null;

  return (
    <div
      className={`bg-slate-50/75 rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-4 ${className}`}
    >
      <div className="flex items-center gap-2 pb-3 border-b border-slate-200/80">
        <svg
          className="w-5 h-5 text-emerald-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
          />
        </svg>
        <h4 className="font-semibold text-slate-900 text-sm">
          Tourism Knowledge & Exploration Network
        </h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        {/* Located In */}
        {context.located_in && (
          <div>
            <span className="text-slate-400 font-medium block mb-1">Located In</span>
            <Link
              href={`/${locale}/districts/${context.located_in.slug}`}
              className="inline-flex items-center gap-1 font-semibold text-slate-800 hover:text-emerald-600 transition-colors"
            >
              <svg className="w-3.5 h-3.5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {context.located_in.name} District
            </Link>
          </div>
        )}

        {/* Categories */}
        {context.categories.length > 0 && (
          <div>
            <span className="text-slate-400 font-medium block mb-1">Themes & Categories</span>
            <div className="flex flex-wrap gap-1.5">
              {context.categories.map((c) => (
                <span
                  key={c.id}
                  className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-medium"
                >
                  {c.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Activities */}
        {context.activities.length > 0 && (
          <div>
            <span className="text-slate-400 font-medium block mb-1">Key Experiences</span>
            <div className="flex flex-wrap gap-1.5">
              {context.activities.map((a) => (
                <span
                  key={a.id}
                  className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-medium"
                >
                  {a.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Nearby Attractions */}
        {context.nearby.length > 0 && (
          <div>
            <span className="text-slate-400 font-medium block mb-1">Nearby Attractions</span>
            <div className="space-y-1">
              {context.nearby.map((n) => (
                <Link
                  key={n.id}
                  href={`/${locale}/destinations/${n.slug}`}
                  className="block font-medium text-slate-700 hover:text-emerald-600 truncate transition-colors"
                >
                  • {n.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
