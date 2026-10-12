'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { SocialContent } from '@/lib/social/types';
import { getSocialFeed } from '@/lib/social/api';
import { SocialContentCard } from '@/components/social/SocialContentCard';

export interface SocialStoriesSectionProps {
  className?: string;
  limit?: number;
}

export function SocialStoriesSection({
  className = '',
  limit = 4,
}: SocialStoriesSectionProps) {
  const [stories, setStories] = useState<SocialContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchStories() {
      try {
        setLoading(true);
        const res = await getSocialFeed({ limit, enableDiversity: true });
        if (isMounted) {
          setStories(res.items.slice(0, limit));
        }
      } catch {
        // Fallback gracefully handled by getSocialFeed
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    fetchStories();
    return () => {
      isMounted = false;
    };
  }, [limit]);

  if (!loading && stories.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Stories From Chhattisgarh"
      className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24 animate-fade-in ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-emerald/10 text-forest-emerald text-xs font-mono font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Community Stories</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-sans font-bold text-charcoal-stone dark:text-zinc-100 font-mukta">
            Stories From Chhattisgarh
          </h2>
          <p className="text-sm text-charcoal-stone/70 dark:text-zinc-400 mt-1 max-w-2xl font-mukta">
            Experience Chhattisgarh through the lenses of verified regional creators, photographers, and travelers.
          </p>
        </div>

        <Link
          href="/social"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-forest-emerald/10 hover:bg-forest-emerald/20 text-forest-emerald text-xs font-bold transition-colors w-fit font-mukta"
        >
          <span>View all Stories</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(limit)].map((_, i) => (
            <div
              key={i}
              className="h-80 rounded-3xl bg-zinc-100 dark:bg-zinc-800 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stories.map((story, idx) => (
            <SocialContentCard
              key={story.id}
              content={story}
              variant="default"
              priority={idx < 2}
            />
          ))}
        </div>
      )}
    </section>
  );
}
