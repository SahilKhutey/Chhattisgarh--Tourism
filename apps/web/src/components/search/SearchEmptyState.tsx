'use client';

import React from 'react';
import { SearchX, Compass, MapPin } from 'lucide-react';

interface SearchEmptyStateProps {
  query?: string;
  onExploreDistrict: (district: string) => void;
  onExploreCategory: (category: string) => void;
}

export function SearchEmptyState({
  query,
  onExploreDistrict,
  onExploreCategory,
}: SearchEmptyStateProps) {
  return (
    <div
      data-testid="search-empty-state"
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-8 sm:p-12 text-center bg-slate-50/50 dark:bg-slate-900/30 my-6"
    >
      <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-4 text-slate-400 dark:text-slate-500 mb-4">
        <SearchX className="h-8 w-8" aria-hidden="true" />
      </div>

      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
        {query ? `No places matched “${query}”` : 'No tourism content found'}
      </h3>

      <div className="mt-3 max-w-md text-sm text-slate-500 dark:text-slate-400 space-y-1">
        <p>Try one of the following to discover destinations:</p>
        <ul className="list-disc list-inside text-left mx-auto w-fit text-xs text-slate-600 dark:text-slate-300 pt-1 space-y-0.5">
          <li>Check for spelling errors or alternate names</li>
          <li>Use broader keywords (e.g. “waterfall” instead of full name)</li>
          <li>Filter by a famous district like Bastar or Raipur</li>
          <li>Search in Hindi (e.g. “जलप्रपात” or “मंदिर”)</li>
        </ul>
      </div>

      <div className="mt-6 flex flex-col items-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Popular Suggestions:
        </span>
        <div className="flex flex-wrap justify-center gap-2">
          {['Bastar', 'Raipur', 'Bilaspur', 'Surguja'].map((dist) => (
            <button
              key={dist}
              type="button"
              onClick={() => onExploreDistrict(dist)}
              className="inline-flex items-center gap-1 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-600 transition-colors"
            >
              <MapPin className="h-3 w-3 text-emerald-500" aria-hidden="true" />
              Explore {dist}
            </button>
          ))}

          {['Waterfalls', 'Temples', 'Heritage', 'Wildlife'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => onExploreCategory(cat.toLowerCase())}
              className="inline-flex items-center gap-1 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-600 transition-colors"
            >
              <Compass className="h-3 w-3 text-emerald-500" aria-hidden="true" />
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
