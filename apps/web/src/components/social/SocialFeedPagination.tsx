'use client';

import React from 'react';
import { Loader2, ChevronDown } from 'lucide-react';

interface SocialFeedPaginationProps {
  onLoadMore?: () => void;
  loading?: boolean;
  hasMore?: boolean;
  className?: string;
}

export function SocialFeedPagination({
  onLoadMore,
  loading = false,
  hasMore = true,
  className = '',
}: SocialFeedPaginationProps) {
  if (!hasMore) {
    return (
      <div className={`flex flex-col items-center justify-center py-8 text-center ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mb-2" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
          You've explored all current verified regional stories.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center py-8 ${className}`}
      aria-live="polite"
    >
      <button
        type="button"
        onClick={onLoadMore}
        disabled={loading}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm font-bold border border-zinc-200 dark:border-zinc-800 shadow-xs hover:border-emerald-500/40 hover:shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
        aria-label={loading ? 'Loading more stories' : 'Load more stories from Chhattisgarh creators'}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-forest-emerald" />
            <span>Loading regional stories...</span>
          </>
        ) : (
          <>
            <span>Load More Stories</span>
            <ChevronDown className="w-4 h-4 text-emerald-600" />
          </>
        )}
      </button>
    </div>
  );
}
