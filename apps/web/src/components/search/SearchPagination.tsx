'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SearchPaginationProps {
  currentPage: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function SearchPagination({
  currentPage,
  pageSize,
  total,
  onPageChange,
}: SearchPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  if (totalPages <= 1) return null;

  return (
    <nav
      role="navigation"
      aria-label="Pagination Navigation"
      className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 px-4 py-4 sm:px-0 mt-8"
    >
      <div className="flex w-0 flex-1">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-600 disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Previous
        </button>
      </div>

      <div className="hidden md:flex items-center gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
          const isCurrent = p === currentPage;
          return (
            <button
              key={p}
              type="button"
              aria-current={isCurrent ? 'page' : undefined}
              onClick={() => onPageChange(p)}
              className={`rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                isCurrent
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {p}
            </button>
          );
        })}
      </div>

      <div className="flex w-0 flex-1 justify-end">
        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-600 disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          Next
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}
