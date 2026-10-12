'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { SocialContent } from '@/lib/social/types';
import { SocialContentCard } from './SocialContentCard';

interface SocialFeaturedContentProps {
  items: SocialContent[];
  title?: string;
  subtitle?: string;
  className?: string;
}

export function SocialFeaturedContent({
  items,
  title = 'Featured From Chhattisgarh',
  subtitle = 'Curated stories and moments capturing living culture and untouched wilderness',
  className = '',
}: SocialFeaturedContentProps) {
  if (!items || items.length === 0) return null;

  const [heroItem, ...secondaryItems] = items.slice(0, 3);

  return (
    <section
      aria-label="Featured Tourism Stories"
      className={`flex flex-col gap-4 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Sparkles className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {title}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {subtitle}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Main Hero Card */}
        {heroItem && (
          <div className="lg:col-span-7 xl:col-span-8 h-full">
            <SocialContentCard
              content={heroItem}
              variant="featured"
              priority={true}
              showDescription={true}
              className="h-full shadow-md"
            />
          </div>
        )}

        {/* Secondary Featured Cards */}
        {secondaryItems.length > 0 && (
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col sm:grid sm:grid-cols-2 lg:flex lg:flex-col gap-4">
            {secondaryItems.map((item) => (
              <div key={item.id} className="flex-1">
                <SocialContentCard
                  content={item}
                  variant="default"
                  priority={false}
                  showDescription={false}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
