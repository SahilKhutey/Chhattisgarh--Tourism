'use client';

import React from 'react';
import Link from 'next/link';
import { SocialContent } from '@/lib/social/types';
import { SocialContentMedia } from './SocialContentMedia';
import { SocialContentMeta } from './SocialContentMeta';
import { SocialOpenSourceButton } from './SocialOpenSourceButton';

export interface SocialContentCardProps {
  content: SocialContent;
  variant?: 'default' | 'featured' | 'compact';
  priority?: boolean;
  className?: string;
  showDescription?: boolean;
  onMediaClick?: (content: SocialContent) => void;
}

export function SocialContentCard({
  content,
  variant = 'default',
  priority = false,
  className = '',
  showDescription = false,
  onMediaClick,
}: SocialContentCardProps) {
  const isCompact = variant === 'compact';
  const isFeatured = variant === 'featured';

  return (
    <article
      className={`group relative flex flex-col h-full rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-3 sm:p-3.5 transition-all duration-220 ease-out hover:shadow-xl hover:shadow-emerald-950/5 hover:-translate-y-1 focus-within:ring-2 focus-within:ring-emerald-500 ${
        isFeatured
          ? 'bg-gradient-to-b from-emerald-50/50 to-white dark:from-emerald-950/20 dark:to-zinc-900 border-emerald-500/30'
          : ''
      } ${className}`}
      aria-labelledby={`social-card-title-${content.id}`}
    >
      {/* Media Box linking to detail or triggering lightbox preview */}
      {onMediaClick ? (
        <button
          type="button"
          onClick={() => onMediaClick(content)}
          className="block w-full text-left focus:outline-hidden cursor-pointer"
          aria-label={`Preview story: ${content.title}`}
        >
          <SocialContentMedia
            thumbnailUrl={content.thumbnail_url}
            title={content.title}
            contentType={content.content_type}
            provider={content.provider}
            durationSeconds={content.duration_seconds}
            aspectRatio={isFeatured ? '16/9' : isCompact ? '1/1' : '4/5'}
            priority={priority}
          />
        </button>
      ) : (
        <Link
          href={`/social/content/${content.id}`}
          className="block focus:outline-hidden"
          aria-label={`View story: ${content.title}`}
        >
          <SocialContentMedia
            thumbnailUrl={content.thumbnail_url}
            title={content.title}
            contentType={content.content_type}
            provider={content.provider}
            durationSeconds={content.duration_seconds}
            aspectRatio={isFeatured ? '16/9' : isCompact ? '1/1' : '4/5'}
            priority={priority}
          />
        </Link>
      )}

      {/* Metadata & Actions */}
      <SocialContentMeta
        creator={content.creator}
        title={content.title}
        caption={content.caption}
        districtId={content.district_id}
        placeSlug={content.place_slug}
        placeName={content.place_name}
        festivalName={content.festival_name}
        publishedAt={content.published_at}
        showDescription={showDescription || isFeatured}
        className={isCompact ? 'pt-2 gap-1.5' : 'pt-3'}
      >
        <div className="pt-1">
          <SocialOpenSourceButton
            sourceUrl={content.source_url}
            provider={content.provider}
            actionLabel={content.original_platform_action_label}
            variant={isCompact ? 'compact' : 'secondary'}
          />
        </div>
      </SocialContentMeta>
    </article>
  );
}
