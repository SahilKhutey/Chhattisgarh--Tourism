'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Sparkles } from 'lucide-react';

interface SocialContextBadgeProps {
  districtId?: string | null;
  placeSlug?: string | null;
  placeName?: string | null;
  festivalName?: string | null;
  interactive?: boolean;
  className?: string;
}

export function SocialContextBadge({
  districtId,
  placeSlug,
  placeName,
  festivalName,
  interactive = false,
  className = '',
}: SocialContextBadgeProps) {
  if (!districtId && !placeSlug && !placeName && !festivalName) return null;

  const displayName =
    placeName ||
    (placeSlug
      ? placeSlug
          .split('-')
          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
          .join(' ')
      : null) ||
    (districtId ? districtId.charAt(0).toUpperCase() + districtId.slice(1) : '');

  const href = placeSlug
    ? `/social/places/${placeSlug}`
    : districtId
    ? `/social/districts/${districtId.toLowerCase()}`
    : null;

  const content = (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium text-emerald-800 dark:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1 rounded-full transition-colors border border-emerald-500/20 ${className}`}
    >
      <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
      <span className="truncate max-w-[140px] sm:max-w-[180px]">{displayName}</span>
      {districtId && placeSlug && (
        <span className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70 capitalize">
          • {districtId}
        </span>
      )}
    </span>
  );

  if (interactive && href) {
    return (
      <Link
        href={href}
        className="inline-block group focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-full"
        onClick={(e) => e.stopPropagation()}
        aria-label={`View social stories for ${displayName}`}
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {content}
      {festivalName && (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-800 dark:text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
          <Sparkles className="w-3 h-3 text-amber-500 shrink-0" aria-hidden="true" />
          <span className="truncate max-w-[120px]">{festivalName}</span>
        </span>
      )}
    </div>
  );
}
