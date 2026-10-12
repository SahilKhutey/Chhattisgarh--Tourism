'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Users } from 'lucide-react';
import { SocialCreator } from '@/lib/social/types';
import { SocialCreatorCard } from './SocialCreatorCard';

interface SocialCreatorStripProps {
  creators: SocialCreator[];
  className?: string;
  showTitle?: boolean;
}

export function SocialCreatorStrip({
  creators,
  className = '',
  showTitle = true,
}: SocialCreatorStripProps) {
  if (!creators || creators.length === 0) return null;

  return (
    <section
      aria-label="Regional Creators Discovery"
      className={`p-3.5 sm:p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-2xs ${className}`}
    >
      {showTitle && (
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
              <Users className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                Verified Regional Creators
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Local voices sharing authentic Chhattisgarh perspectives
              </p>
            </div>
          </div>

          <Link
            href="/social/feed?tab=creators"
            className="inline-flex items-center gap-1 text-xs font-semibold text-forest-emerald hover:text-emerald-700 dark:text-emerald-400 group"
          >
            <span>Explore all</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      )}

      {/* Horizontal Scroll Area */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar scroll-smooth">
        {creators.map((creator) => (
          <SocialCreatorCard
            key={creator.id || creator.handle}
            creator={creator}
            variant="pill"
          />
        ))}
      </div>
    </section>
  );
}
