'use client';

import React from 'react';
import { Filter, X } from 'lucide-react';
import type { SearchFacet } from '@/lib/api/search';

interface SearchFiltersProps {
  district?: string;
  category?: string;
  contentType?: string;
  districts: SearchFacet[];
  categories: SearchFacet[];
  contentTypes: SearchFacet[];
  onFilterChange: (filters: {
    district?: string;
    category?: string;
    contentType?: string;
  }) => void;
}

export function SearchFilters({
  district,
  category,
  contentType,
  districts,
  categories,
  contentTypes,
  onFilterChange,
}: SearchFiltersProps) {
  const hasActiveFilters = Boolean(district || category || contentType);

  const handleClearAll = () => {
    onFilterChange({
      district: undefined,
      category: undefined,
      contentType: undefined,
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3 py-3 border-y border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mr-2">
        <Filter className="h-3.5 w-3.5" aria-hidden="true" />
        Filters:
      </div>

      {/* District Select */}
      <div className="relative">
        <label htmlFor="filter-district" className="sr-only">
          Filter by district
        </label>
        <select
          id="filter-district"
          value={district || ''}
          onChange={(e) =>
            onFilterChange({
              district: e.target.value || undefined,
              category,
              contentType,
            })
          }
          className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 focus:border-emerald-500 focus:outline-none"
        >
          <option value="">All Districts</option>
          {districts.map((d) => (
            <option key={d.value} value={d.value}>
              {d.value} ({d.count})
            </option>
          ))}
        </select>
      </div>

      {/* Category Select */}
      <div className="relative">
        <label htmlFor="filter-category" className="sr-only">
          Filter by category
        </label>
        <select
          id="filter-category"
          value={category || ''}
          onChange={(e) =>
            onFilterChange({
              district,
              category: e.target.value || undefined,
              contentType,
            })
          }
          className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 focus:border-emerald-500 focus:outline-none"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.value} value={c.value}>
              {c.value} ({c.count})
            </option>
          ))}
        </select>
      </div>

      {/* Content Type Select */}
      <div className="relative">
        <label htmlFor="filter-type" className="sr-only">
          Filter by content type
        </label>
        <select
          id="filter-type"
          value={contentType || ''}
          onChange={(e) =>
            onFilterChange({
              district,
              category,
              contentType: e.target.value || undefined,
            })
          }
          className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 focus:border-emerald-500 focus:outline-none"
        >
          <option value="">All Types</option>
          {contentTypes.map((t) => (
            <option key={t.value} value={t.value}>
              {t.value} ({t.count})
            </option>
          ))}
        </select>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={handleClearAll}
          className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
        >
          <X className="h-3 w-3" aria-hidden="true" />
          Clear filters
        </button>
      )}
    </div>
  );
}
