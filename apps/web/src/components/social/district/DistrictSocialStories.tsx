'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { SocialContent } from '@/lib/social/types';
import { getDistrictSocialFeed } from '@/lib/social/api';
import { SocialContentCard } from '@/components/social/SocialContentCard';

export interface DistrictSocialStoriesProps {
  districtSlug: string;
  districtName?: string;
  className?: string;
  limit?: number;
}

export function DistrictSocialStories({
  districtSlug,
  districtName,
  className = '',
  limit = 4,
}: DistrictSocialStoriesProps) {
  const [stories, setStories] = useState<SocialContent[]>([]);
  const [loading, setLoading] = useState(true);

  const displayName =
    districtName ||
    districtSlug.charAt(0).toUpperCase() + districtSlug.slice(1);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        setLoading(true);
        const res = await getDistrictSocialFeed(districtSlug, { limit });
        if (isMounted) {
          setStories(res.items.slice(0, limit));
        }
      } catch {
        // Handled silently
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [districtSlug, limit]);

  if (!loading && stories.length === 0) {
    return null;
  }

  return (
    <section
      aria-label={`Creator Stories from ${displayName}`}
      className={`mt-16 pt-12 border-t border-charcoal-stone/10 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-emerald/10 text-forest-emerald text-xs font-mono font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Local Perspectives</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-charcoal-stone">
            Stories from {displayName}
          </h2>
          <p className="text-sm text-charcoal-stone/70 mt-1 max-w-xl">
            Real reels, photography, and cultural expeditions documented by verified regional creators in {displayName}.
          </p>
        </div>

        <Link
          href={`/social/districts/${districtSlug.toLowerCase()}`}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-forest-emerald/10 hover:bg-forest-emerald/20 text-forest-emerald text-xs font-bold transition-colors w-fit"
        >
          <span>Explore All {displayName} Stories</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(limit)].map((_, i) => (
            <div
              key={i}
              className="h-72 rounded-3xl bg-charcoal-stone/5 animate-pulse"
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
