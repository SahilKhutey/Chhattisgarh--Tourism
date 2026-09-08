'use client';

import React from 'react';
import { Compass, Sparkles } from 'lucide-react';
import { DiscoveryResult } from '../../lib/discovery/types';
import { SearchResultCard } from './SearchResultCard';

interface SearchResultsProps {
  items: DiscoveryResult[];
  total: number;
  loading?: boolean;
}

export function SearchResults({ items, total, loading = false }: SearchResultsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-80 bg-white rounded-2xl border border-stone-200 p-4 space-y-4 animate-pulse shadow-sm"
          >
            <div className="h-40 bg-stone-100 rounded-xl" />
            <div className="h-4 bg-stone-100 rounded w-3/4" />
            <div className="h-3 bg-stone-100 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center max-w-xl mx-auto shadow-sm space-y-3">
        <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
          <Compass className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-stone-900">
          No Tourism Experiences Found
        </h3>
        <p className="text-xs text-stone-500 leading-relaxed">
          We couldn&apos;t find any published content matching your search terms or active filters. Try broadening your keywords or clearing selected categories.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-stone-500 px-1">
        <div className="flex items-center gap-1.5 font-medium">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>
            Showing <strong className="text-stone-900">{items.length}</strong> of{' '}
            <strong className="text-stone-900">{total}</strong> experiences
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <SearchResultCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

export default SearchResults;
