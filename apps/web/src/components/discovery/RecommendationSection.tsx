import React from "react";
import Link from "next/link";
import { Recommendation } from "@/types/intelligence";
import { RecommendationReason } from "./RecommendationReason";

interface RecommendationSectionProps {
  title?: string;
  subtitle?: string;
  recommendations: Recommendation[];
  locale?: string;
  className?: string;
}

export const RecommendationSection: React.FC<RecommendationSectionProps> = ({
  title = "Recommended Experiences",
  subtitle = "Curated based on thematic connections, regional proximity, and visitor patterns",
  recommendations,
  locale = "en",
  className = "",
}) => {
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <section className={`my-8 ${className}`}>
      <div className="mb-4">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-sm text-slate-500 max-w-2xl">{subtitle}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {recommendations.map((item) => (
          <Link
            key={item.id}
            href={`/${locale}/destinations/${item.slug}`}
            className="group flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-emerald-500/50 transition-all duration-200"
          >
            <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
              {item.thumbnail_url ? (
                <img
                  src={item.thumbnail_url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-slate-100 text-slate-400">
                  <svg
                    className="w-8 h-8 opacity-40 text-emerald-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}

              {item.district && (
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[11px] font-medium bg-black/60 backdrop-blur-sm text-white">
                  {item.district}
                </span>
              )}
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-1">
                  {item.title}
                </h3>

                <div className="mt-2.5">
                  <RecommendationReason reason={item.reason} />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="capitalize">{item.category || item.content_type.toLowerCase()}</span>
                <span className="text-emerald-600 font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                  Explore
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};
