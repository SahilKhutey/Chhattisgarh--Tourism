'use client';

import React from 'react';
import Link from 'next/link';
import { Compass, Sparkles } from 'lucide-react';

interface SocialEmptyStateProps {
  title?: string;
  description?: string;
  onResetFilters?: () => void;
  className?: string;
}

export function SocialEmptyState({
  title = 'No stories here yet',
  description = "We're building the regional creator network across Chhattisgarh. Connect with living heritage and explore destinations instead.",
  onResetFilters,
  className = '',
}: SocialEmptyStateProps) {
  return (
    <div
      role="status"
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-2xs max-w-lg mx-auto ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-forest-emerald dark:text-emerald-400 flex items-center justify-center mb-4">
        <Sparkles className="w-7 h-7" aria-hidden="true" />
      </div>

      <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">
        {title}
      </h3>

      <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
        {description}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors"
          >
            Clear Filters
          </button>
        )}

        <Link
          href="/destinations"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-forest-emerald hover:bg-forest-emerald/90 transition-all shadow-sm active:scale-95"
        >
          <Compass className="w-4 h-4" />
          <span>Explore Destinations →</span>
        </Link>
      </div>
    </div>
  );
}
