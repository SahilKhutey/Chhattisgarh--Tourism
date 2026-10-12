'use client';

import React from 'react';

interface SocialFeedSkeletonProps {
  count?: number;
  className?: string;
}

export function SocialFeedSkeleton({
  count = 8,
  className = '',
}: SocialFeedSkeletonProps) {
  const items = Array.from({ length: count });

  return (
    <div
      aria-label="Loading social content"
      aria-busy="true"
      className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 ${className}`}
    >
      {items.map((_, idx) => (
        <div
          key={idx}
          className="flex flex-col rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-3 sm:p-3.5 animate-pulse"
        >
          {/* Media box skeleton with 4:5 ratio */}
          <div className="w-full aspect-4/5 rounded-2xl bg-zinc-200 dark:bg-zinc-800" />

          {/* Metadata skeleton */}
          <div className="flex flex-col gap-2.5 pt-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-800 shrink-0" />
              <div className="flex flex-col gap-1 w-full">
                <div className="w-24 h-3 rounded-md bg-zinc-200 dark:bg-zinc-800" />
                <div className="w-16 h-2 rounded-md bg-zinc-200 dark:bg-zinc-800" />
              </div>
            </div>

            <div className="w-20 h-5 rounded-full bg-zinc-200 dark:bg-zinc-800" />

            <div className="w-full h-4 rounded-md bg-zinc-200 dark:bg-zinc-800" />
            <div className="w-3/4 h-3 rounded-md bg-zinc-200 dark:bg-zinc-800" />

            <div className="w-full h-8 rounded-xl bg-zinc-200 dark:bg-zinc-800 mt-1" />
          </div>
        </div>
      ))}
    </div>
  );
}
