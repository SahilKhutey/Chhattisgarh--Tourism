'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle2, User } from 'lucide-react';
import { SocialCreator } from '@/lib/social/types';
import { SocialContextBadge } from './SocialContextBadge';

interface SocialContentMetaProps {
  creator?: SocialCreator;
  title: string;
  caption?: string | null;
  districtId?: string | null;
  placeSlug?: string | null;
  placeName?: string | null;
  festivalName?: string | null;
  publishedAt?: string | null;
  showDescription?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function SocialContentMeta({
  creator,
  title,
  caption,
  districtId,
  placeSlug,
  placeName,
  festivalName,
  publishedAt,
  showDescription = false,
  className = '',
  children,
}: SocialContentMetaProps) {
  const formattedDate = publishedAt
    ? new Date(publishedAt).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <div className={`flex flex-col gap-2.5 pt-3 ${className}`}>
      {/* Creator Bar */}
      {creator && (
        <div className="flex items-center justify-between gap-2">
          <Link
            href={`/social/creators/${creator.handle}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 group/creator min-w-0 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg p-0.5"
            aria-label={`View creator profile of ${creator.display_name}`}
          >
            {creator.avatar_url ? (
              <div className="relative w-7 h-7 rounded-full overflow-hidden shrink-0 border border-emerald-500/30">
                <Image
                  src={creator.avatar_url}
                  alt={creator.display_name}
                  fill
                  sizes="28px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-500/20">
                <User className="w-3.5 h-3.5" aria-hidden="true" />
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover/creator:text-forest-emerald dark:group-hover/creator:text-emerald-400 transition-colors">
                  {creator.display_name}
                </span>
                {creator.is_verified && (
                  <CheckCircle2
                    className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0"
                    aria-label="Verified Local Creator"
                  />
                )}
              </div>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                @{creator.handle}
              </span>
            </div>
          </Link>

          {formattedDate && (
            <span className="text-[10px] text-zinc-400 shrink-0 font-medium">
              {formattedDate}
            </span>
          )}
        </div>
      )}

      {/* Tourism Location Badge */}
      <SocialContextBadge
        districtId={districtId}
        placeSlug={placeSlug}
        placeName={placeName}
        festivalName={festivalName}
        interactive={true}
      />

      {/* Story Title & Optional Description */}
      <div className="flex flex-col gap-1">
        <h3 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-snug">
          {title}
        </h3>
        {showDescription && caption && (
          <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
            {caption}
          </p>
        )}
      </div>

      {/* External Action Button / Children */}
      {children && <div className="mt-1">{children}</div>}
    </div>
  );
}
