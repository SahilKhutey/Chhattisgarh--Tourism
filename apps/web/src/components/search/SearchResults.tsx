'use client';

import React from 'react';
import type { SearchResult } from '@/lib/api/search';
import { SearchResultCard } from './SearchResultCard';
import { SearchPagination } from './SearchPagination';

interface SearchResultsProps {
  results: SearchResult[];
  total: number;
  currentPage: number;
  pageSize: number;
  locale: string;
  query?: string;
  onPageChange: (page: number) => void;
}

export function SearchResults({
  results,
  total,
  currentPage,
  pageSize,
  locale,
  query,
  onPageChange,
}: SearchResultsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
        <span>
          Found <strong className="text-slate-900 dark:text-slate-100">{total}</strong>{' '}
          {total === 1 ? 'place' : 'places'}
          {query ? ` for “${query}”` : ''}
        </span>
        <span>
          Page {currentPage} of {Math.max(1, Math.ceil(total / pageSize))}
        </span>
      </div>

      <div
        role="feed"
        aria-busy={false}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {results.map((result) => (
          <SearchResultCard key={result.id} result={result} locale={locale} />
        ))}
      </div>

      <SearchPagination
        currentPage={currentPage}
        pageSize={pageSize}
        total={total}
        onPageChange={onPageChange}
      />
    </div>
  );
}
