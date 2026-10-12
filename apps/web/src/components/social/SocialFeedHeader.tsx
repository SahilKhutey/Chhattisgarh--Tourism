'use client';

import React from 'react';
import Link from 'next/link';
import { Compass, Sparkles, ArrowRight } from 'lucide-react';

interface SocialFeedHeaderProps {
  title?: string;
  subtitle?: string;
  badge?: string;
  creatorLink?: boolean;
  className?: string;
}

export function SocialFeedHeader({
  title = 'Social Stories',
  subtitle = 'Discover Chhattisgarh through the people who live, travel and create here.',
  badge = 'Regional Social Discovery',
  creatorLink = true,
  className = '',
}: SocialFeedHeaderProps) {
  return (
    <header className={`flex flex-col gap-3 py-2 sm:py-4 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="max-w-2xl">
          {badge && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20 mb-2.5 backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{badge}</span>
            </div>
          )}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 font-sans">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
            {subtitle}
          </p>
        </div>

        {creatorLink && (
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <Link
              href="/destinations"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/40 hover:text-forest-emerald transition-all shadow-2xs"
            >
              <Compass className="w-3.5 h-3.5 text-emerald-600" />
              <span>Destinations</span>
            </Link>

            <Link
              href="/social/feed"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-forest-emerald hover:bg-forest-emerald/90 text-white shadow-xs transition-all active:scale-95"
            >
              <span>Explore Feed</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
