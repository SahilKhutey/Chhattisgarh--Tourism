'use client';

import React from 'react';
import { Film, Image as ImageIcon, Video, Zap, BookOpen } from 'lucide-react';
import { SocialContentType } from '@/lib/social/types';

interface SocialContentTypeBadgeProps {
  contentType?: SocialContentType | string | null;
  type?: SocialContentType | string | null;
  className?: string;
  size?: 'sm' | 'md';
}

export function SocialContentTypeBadge({
  contentType,
  type,
  className = '',
  size = 'sm',
}: SocialContentTypeBadgeProps) {
  const resolved = contentType || type;
  if (!resolved) return null;

  const normalized = resolved.toUpperCase();

  const sizeClasses =
    size === 'sm'
      ? 'text-[11px] px-2 py-0.5 gap-1 font-medium'
      : 'text-xs px-2.5 py-1 gap-1.5 font-semibold';

  switch (normalized) {
    case 'REEL':
      return (
        <span
          className={`inline-flex items-center rounded-md bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/20 backdrop-blur-xs ${sizeClasses} ${className}`}
          aria-label="Format: Reel"
        >
          <Film className="w-3 h-3 text-purple-600 dark:text-purple-400" aria-hidden="true" />
          <span>Reel</span>
        </span>
      );

    case 'SHORT':
      return (
        <span
          className={`inline-flex items-center rounded-md bg-red-500/15 text-red-700 dark:text-red-300 border border-red-500/20 backdrop-blur-xs ${sizeClasses} ${className}`}
          aria-label="Format: Short"
        >
          <Zap className="w-3 h-3 text-red-600 dark:text-red-400" aria-hidden="true" />
          <span>Short</span>
        </span>
      );

    case 'VIDEO':
      return (
        <span
          className={`inline-flex items-center rounded-md bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/20 backdrop-blur-xs ${sizeClasses} ${className}`}
          aria-label="Format: Video"
        >
          <Video className="w-3 h-3 text-sky-600 dark:text-sky-400" aria-hidden="true" />
          <span>Video</span>
        </span>
      );

    case 'CULTURAL_STORY':
      return (
        <span
          className={`inline-flex items-center rounded-md bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/20 backdrop-blur-xs ${sizeClasses} ${className}`}
          aria-label="Format: Cultural Folklore"
        >
          <BookOpen className="w-3 h-3 text-amber-600 dark:text-amber-400" aria-hidden="true" />
          <span>Folklore</span>
        </span>
      );

    case 'POST':
    default:
      return (
        <span
          className={`inline-flex items-center rounded-md bg-zinc-500/15 text-zinc-700 dark:text-zinc-300 border border-zinc-500/20 backdrop-blur-xs ${sizeClasses} ${className}`}
          aria-label="Format: Post"
        >
          <ImageIcon className="w-3 h-3 text-zinc-600 dark:text-zinc-400" aria-hidden="true" />
          <span>Post</span>
        </span>
      );
  }
}
