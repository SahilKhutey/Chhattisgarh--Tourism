'use client';

import React from 'react';
import { SocialPlatform } from '@/lib/social/types';

interface SocialPlatformBadgeProps {
  platform?: SocialPlatform | string | null;
  className?: string;
  size?: 'sm' | 'md';
}

export function SocialPlatformBadge({
  platform,
  className = '',
  size = 'sm',
}: SocialPlatformBadgeProps) {
  if (!platform) return null;

  const normalized = platform.toUpperCase();

  const isInstagram = normalized === 'INSTAGRAM';
  const isYouTube = normalized === 'YOUTUBE';

  const sizeClasses =
    size === 'sm'
      ? 'text-[11px] px-2 py-0.5 gap-1.5'
      : 'text-xs px-2.5 py-1 gap-1.5';

  if (isInstagram) {
    return (
      <span
        className={`inline-flex items-center font-medium rounded-full bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 text-pink-700 dark:text-pink-300 border border-pink-500/20 backdrop-blur-sm shadow-xs ${sizeClasses} ${className}`}
        aria-label="Instagram Platform Content"
      >
        <svg
          className="w-3 h-3 text-pink-600 dark:text-pink-400 shrink-0"
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
        <span>Instagram</span>
      </span>
    );
  }

  if (isYouTube) {
    return (
      <span
        className={`inline-flex items-center font-medium rounded-full bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/20 backdrop-blur-sm shadow-xs ${sizeClasses} ${className}`}
        aria-label="YouTube Platform Content"
      >
        <svg
          className="w-3.5 h-3.5 text-red-600 dark:text-red-400 shrink-0"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
        <span>YouTube</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20 backdrop-blur-sm ${sizeClasses} ${className}`}
      aria-label="Chhattisgarh Official Verified Content"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      <span>Verified Source</span>
    </span>
  );
}
