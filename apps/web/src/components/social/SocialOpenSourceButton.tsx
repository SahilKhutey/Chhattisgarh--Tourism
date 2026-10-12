'use client';

import React from 'react';
import { ExternalLink } from 'lucide-react';
import { SocialPlatform } from '@/lib/social/types';

interface SocialOpenSourceButtonProps {
  sourceUrl: string;
  provider?: SocialPlatform | string | null;
  actionLabel?: string | null;
  className?: string;
  variant?: 'primary' | 'secondary' | 'compact';
}

export function SocialOpenSourceButton({
  sourceUrl,
  provider,
  actionLabel,
  className = '',
  variant = 'secondary',
}: SocialOpenSourceButtonProps) {
  if (!sourceUrl || sourceUrl === 'SOURCE_UNAVAILABLE') {
    return null;
  }

  const normalized = (provider || '').toUpperCase();
  const isYouTube = normalized === 'YOUTUBE';
  const isInstagram = normalized === 'INSTAGRAM';

  const defaultLabel = actionLabel || (isYouTube
    ? 'Watch on YouTube'
    : isInstagram
    ? 'View on Instagram'
    : 'View Original Source');

  const ariaDescription = `Open original content on ${
    isYouTube ? 'YouTube' : isInstagram ? 'Instagram' : 'source platform'
  } in a new window`;

  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-xl select-none';

  let variantStyles = '';
  if (variant === 'primary') {
    variantStyles =
      'px-4 py-2 text-xs sm:text-sm bg-forest-emerald hover:bg-forest-emerald/90 text-white shadow-md active:scale-95 gap-2';
  } else if (variant === 'compact') {
    variantStyles =
      'px-2.5 py-1 text-[11px] bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 gap-1.5 border border-zinc-200/80 dark:border-zinc-700/80';
  } else {
    // Secondary default
    variantStyles =
      'w-full px-3 py-2 text-xs bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/80 dark:hover:bg-zinc-700/80 text-zinc-900 dark:text-zinc-100 gap-1.5 border border-zinc-200 dark:border-zinc-700/60 shadow-2xs';
  }

  return (
    <a
      href={sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaDescription}
      onClick={(e) => e.stopPropagation()}
      className={`${baseStyles} ${variantStyles} ${className}`}
    >
      <span className="truncate">{defaultLabel}</span>
      <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-70" aria-hidden="true" />
    </a>
  );
}
