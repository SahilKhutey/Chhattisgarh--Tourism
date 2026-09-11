'use client';

import React from 'react';
import type { SearchFacet } from '@/lib/api/search';

interface SearchFacetsProps {
  title: string;
  facets: SearchFacet[];
  selectedValue?: string;
  onSelect: (value?: string) => void;
}

export function SearchFacets({
  title,
  facets,
  selectedValue,
  onSelect,
}: SearchFacetsProps) {
  if (!facets || facets.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {title}
      </h3>
      <div className="flex flex-wrap gap-1.5">
        {facets.map((facet) => {
          const isSelected = selectedValue === facet.value;
          return (
            <button
              key={facet.value}
              type="button"
              onClick={() => onSelect(isSelected ? undefined : facet.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                isSelected
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span className="capitalize">{facet.value}</span>
              <span
                className={`ml-1.5 text-[11px] ${
                  isSelected ? 'text-emerald-100' : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {facet.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
