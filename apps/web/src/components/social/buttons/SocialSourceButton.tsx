'use client';

import React from 'react';
import { ExternalLink } from 'lucide-react';
import { trackSocialEvent } from '@/lib/social/analytics';
import { SocialPlatform } from '@/lib/social/types';
import { cn } from '@/lib/ui/cn';

export interface SocialSourceButtonProps {
  sourceUrl: string;
  provider?: SocialPlatform | string | null;
  contentId?: string;
  actionLabel?: string | null;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'compact';
}

export function SocialSourceButton({
  sourceUrl,
  provider,
  contentId,
  actionLabel,
  className = '',
  variant = 'secondary',
}: SocialSourceButtonProps) {
  if (!sourceUrl || sourceUrl === 'SOURCE_UNAVAILABLE') {
    return null;
  }

  const normalized = (provider || '').toUpperCase();
  const isYouTube = normalized === 'YOUTUBE';
  const isInstagram = normalized === 'INSTAGRAM';

  const defaultLabel =
    actionLabel ||
    (isYouTube
      ? 'Watch on YouTube'
      : isInstagram
      ? 'View on Instagram'
      : 'View Original Source');

  const ariaDescription = `Open original content on ${
    isYouTube ? 'YouTube' : isInstagram ? 'Instagram' : 'source platform'
  } in a new window`;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.stopPropagation();
    if (contentId) {
      trackSocialEvent('social_source_click', {
        contentId,
        platform: normalized || 'UNKNOWN',
        sourceUrl,
      });
    }
  };

  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-160 cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-xl select-none min-h-[44px] active:scale-[0.98]';

  let variantStyles = '';
  if (variant === 'primary') {
    variantStyles =
      'px-5 py-2.5 text-xs sm:text-sm bg-forest-emerald hover:bg-forest-emerald/90 text-white shadow-md gap-2';
  } else if (variant === 'ghost') {
    variantStyles =
      'px-3 py-2 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 gap-1.5';
  } else if (variant === 'compact') {
    variantStyles =
      'min-h-[36px] px-3 py-1.5 text-xs bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 gap-1.5 border border-zinc-200/80 dark:border-zinc-700/80';
  } else {
    // Secondary default
    variantStyles =
      'w-full px-4 py-2.5 text-xs sm:text-sm bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/90 dark:hover:bg-zinc-700/90 text-zinc-900 dark:text-zinc-100 gap-2 border border-zinc-200 dark:border-zinc-700/60 shadow-2xs';
  }

  return (
    <a
      href={sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaDescription}
      onClick={handleClick}
      className={cn(baseStyles, variantStyles, className)}
    >
      {isYouTube && (
        <svg
          className="w-4 h-4 text-red-600 shrink-0"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      )}
      {isInstagram && (
        <svg
          className="w-4 h-4 text-pink-500 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
      )}
      <span className="truncate">{defaultLabel}</span>
      <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-70 ml-auto" aria-hidden="true" />
    </a>
  );
}
