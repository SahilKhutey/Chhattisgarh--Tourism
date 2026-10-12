'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { SocialContent } from '@/lib/social/types';
import { getSocialTemplate } from '@/lib/social/templates';
import { getSocialFeed } from '@/lib/social/api';
import { SocialFeedGrid } from './SocialFeedGrid';
import { SocialFeedSkeleton } from './SocialFeedSkeleton';

interface EmbeddedSocialModuleProps {
  title?: string;
  subtitle?: string;
  placeSlug?: string;
  districtId?: string;
  festivalName?: string;
  culturalTag?: string;
  limit?: number;
  layout?: 'compact-grid' | 'regional-showcase' | 'standard-grid';
  className?: string;
}

export function EmbeddedSocialModule({
  title,
  subtitle,
  placeSlug,
  districtId,
  festivalName,
  culturalTag,
  limit = 4,
  layout = 'compact-grid',
  className = '',
}: EmbeddedSocialModuleProps) {
  const [items, setItems] = useState<SocialContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        setLoading(true);
        const res = await getSocialFeed({
          placeSlug,
          districtId,
          culturalTag,
          limit,
        });
        if (isMounted) {
          setItems(res.items);
        }
      } catch {
        // Handled silently for embedded widget
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
  }, [placeSlug, districtId, culturalTag, limit]);

  if (!loading && items.length === 0) {
    return null;
  }

  const defaultTitle = placeSlug
    ? 'From Regional Creators'
    : districtId
    ? `${districtId.charAt(0).toUpperCase() + districtId.slice(1)} Social Stories`
    : 'Voices of Chhattisgarh';

  const defaultSubtitle =
    subtitle || 'Real-time reels, videos, and photography shared by verified travelers';

  const viewAllHref = placeSlug
    ? `/social/places/${placeSlug}`
    : districtId
    ? `/social/districts/${districtId}`
    : '/social/feed';

  const template = getSocialTemplate(layout);

  return (
    <section
      aria-label="Embedded Regional Social Stories"
      className={`rounded-3xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 p-5 sm:p-6 lg:p-8 flex flex-col gap-6 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-forest-emerald dark:text-emerald-400 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {title || defaultTitle}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {defaultSubtitle}
            </p>
          </div>
        </div>

        <Link
          href={viewAllHref}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-forest-emerald hover:text-emerald-700 dark:text-emerald-400 transition-colors self-start sm:self-auto group"
        >
          <span>View all stories</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {loading ? (
        <SocialFeedSkeleton count={limit} />
      ) : (
        <SocialFeedGrid template={template} items={items} />
      )}
    </section>
  );
}
