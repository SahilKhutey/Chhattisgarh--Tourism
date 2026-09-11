'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Navigation, Tag } from 'lucide-react';
import type { SearchResult } from '@/lib/api/search';

interface SearchResultCardProps {
  result: SearchResult;
  locale: string;
}

export function SearchResultCard({ result, locale }: SearchResultCardProps) {
  // Canonical route resolution based on content type
  const href =
    result.content_type === 'destination' || result.content_type === 'nature'
      ? `/${locale}/destinations/${result.slug}`
      : `/${locale}/content/${result.slug}`;

  return (
    <article
      data-testid={`search-card-${result.slug}`}
      className="group flex flex-col justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
            {result.content_type}
          </span>
          {result.distance_km !== null && result.distance_km !== undefined && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
              <Navigation className="h-3 w-3 text-emerald-600" aria-hidden="true" />
              {result.distance_km} km
            </span>
          )}
        </div>

        <h2 className="mt-3 text-xl font-semibold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
          <Link href={href} className="focus:outline-none focus:underline">
            {result.title}
          </Link>
        </h2>

        {result.description && (
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
            {result.description}
          </p>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
        {result.district && (
          <span className="inline-flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
            <MapPin className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
            {result.district}
          </span>
        )}

        {result.categories && result.categories.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <Tag className="h-3 w-3 text-slate-400" aria-hidden="true" />
            {result.categories.slice(0, 2).map((cat) => (
              <span
                key={cat}
                className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[11px] capitalize"
              >
                {cat}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
