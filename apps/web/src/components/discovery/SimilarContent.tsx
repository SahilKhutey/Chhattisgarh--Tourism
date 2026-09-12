import React from "react";
import Link from "next/link";
import { HybridSearchItem } from "@/types/intelligence";

interface SimilarContentProps {
  items: HybridSearchItem[];
  currentTitle?: string;
  locale?: string;
  className?: string;
}

export const SimilarContent: React.FC<SimilarContentProps> = ({
  items,
  currentTitle,
  locale = "en",
  className = "",
}) => {
  if (!items || items.length === 0) return null;

  return (
    <div className={`mt-12 pt-8 border-t border-slate-200 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900">
            Similar Experiences
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            {currentTitle
              ? `Destinations that share themes and atmosphere with ${currentTitle}`
              : "Explore related destinations and activities"}
          </p>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Semantic Matching
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/${locale}/destinations/${item.slug}`}
            className="group block bg-white rounded-lg border border-slate-200 hover:border-emerald-500/60 overflow-hidden shadow-sm hover:shadow transition-all"
          >
            <div className="aspect-[16/9] bg-slate-100 relative overflow-hidden">
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
                <span className="absolute bottom-2 left-2 text-[11px] font-medium bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded">
                  {item.district}
                </span>
              )}
            </div>

            <div className="p-3.5">
              <h4 className="font-semibold text-slate-900 text-sm group-hover:text-emerald-600 transition-colors line-clamp-1">
                {item.title}
              </h4>
              {item.description && (
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {item.description}
                </p>
              )}
              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>{item.match_reason}</span>
                {item.semantic_score && (
                  <span className="text-emerald-700 font-medium">
                    {Math.round(item.semantic_score * 100)}% match
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
