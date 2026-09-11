'use client';

import React from 'react';

export function SearchLoading() {
  return (
    <div
      role="status"
      aria-label="Loading search results"
      className="space-y-6 my-6 animate-pulse"
    >
      <div className="h-5 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 bg-white dark:bg-slate-900"
          >
            <div className="flex justify-between">
              <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded-full" />
              <div className="h-4 w-12 bg-slate-100 dark:bg-slate-800 rounded" />
            </div>
            <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded" />
              <div className="h-4 w-5/6 bg-slate-100 dark:bg-slate-800 rounded" />
            </div>
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between">
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-4 w-16 bg-slate-100 dark:bg-slate-800 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
