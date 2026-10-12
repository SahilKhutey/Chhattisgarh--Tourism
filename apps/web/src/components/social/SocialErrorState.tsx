'use client';

import React from 'react';
import Link from 'next/link';
import { RefreshCw, Compass, AlertCircle } from 'lucide-react';

interface SocialErrorStateProps {
  onRetry?: () => void;
  className?: string;
}

export function SocialErrorState({
  onRetry,
  className = '',
}: SocialErrorStateProps) {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-2xs max-w-lg mx-auto ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
        <AlertCircle className="w-7 h-7" aria-hidden="true" />
      </div>

      <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">
        We couldn&apos;t load these stories
      </h3>

      <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
        Your destination information and regional itineraries are still available.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        )}

        <Link
          href="/destinations"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-forest-emerald hover:bg-forest-emerald/90 transition-all shadow-sm active:scale-95"
        >
          <Compass className="w-4 h-4" />
          <span>Explore Destinations</span>
        </Link>
      </div>
    </div>
  );
}
