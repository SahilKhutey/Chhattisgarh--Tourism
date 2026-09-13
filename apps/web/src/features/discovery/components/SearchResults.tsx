"use client";

import React from 'react';
import { Compass, AlertCircle, RefreshCw } from 'lucide-react';
import { PlaceCard } from './PlaceCard';
import { DiscoveryPlace } from '../api/discovery-api';

interface SearchResultsProps {
  places: DiscoveryPlace[];
  total: number;
  loading: boolean;
  error?: string | null;
  selectedPlaceId?: string;
  onSelectPlace?: (place: DiscoveryPlace) => void;
  onRetry?: () => void;
  className?: string;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  places,
  total,
  loading,
  error,
  selectedPlaceId,
  onSelectPlace,
  onRetry,
  className = '',
}) => {
  if (loading) {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 ${className}`}>
        {[...Array(6)].map((_, i) => (
          <div
            key={`skeleton-${i}`}
            className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 animate-pulse"
          >
            <div className="aspect-[16/10] w-full rounded-xl bg-zinc-100 dark:bg-zinc-800 mb-4" />
            <div className="h-3 w-1/3 rounded bg-zinc-200 dark:bg-zinc-800 mb-2" />
            <div className="h-5 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800 mb-3" />
            <div className="h-3 w-full rounded bg-zinc-100 dark:bg-zinc-800 mb-1" />
            <div className="h-3 w-4/5 rounded bg-zinc-100 dark:bg-zinc-800" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 p-8 text-center">
        <AlertCircle className="mx-auto h-10 w-10 text-rose-500 mb-3" />
        <h3 className="font-semibold text-base text-zinc-900 dark:text-zinc-100">
          Unable to load destinations
        </h3>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
          {error}
        </p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Try Again
          </button>
        )}
      </div>
    );
  }

  if (places.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 p-12 text-center bg-zinc-50/50 dark:bg-zinc-900/50">
        <Compass className="mx-auto h-12 w-12 text-zinc-400 stroke-1 mb-3" />
        <h3 className="font-semibold text-base text-zinc-900 dark:text-zinc-100">
          No destinations match your search
        </h3>
        <p className="mt-1 text-sm text-zinc-500 max-w-sm mx-auto">
          Try expanding your search query, clearing filters, or exploring nearby places across Chhattisgarh.
        </p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <div className="flex items-center justify-between text-xs text-zinc-500 font-medium">
        <span>Found {total} {total === 1 ? 'destination' : 'destinations'}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {places.map((place) => (
          <PlaceCard
            key={place.id}
            place={place}
            isSelected={selectedPlaceId === place.id}
            onSelect={onSelectPlace}
          />
        ))}
      </div>
    </div>
  );
};
