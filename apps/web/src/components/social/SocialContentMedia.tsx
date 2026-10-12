'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Play, ImageOff } from 'lucide-react';
import { SocialContentType, SocialPlatform } from '@/lib/social/types';
import { SocialPlatformBadge } from './SocialPlatformBadge';
import { SocialContentTypeBadge } from './SocialContentTypeBadge';

interface SocialContentMediaProps {
  thumbnailUrl?: string | null;
  title: string;
  contentType: SocialContentType | string;
  provider?: SocialPlatform | string | null;
  durationSeconds?: number | null;
  aspectRatio?: '4/5' | '16/9' | '9/16' | '1/1' | string;
  priority?: boolean;
  className?: string;
  showBadges?: boolean;
}

export function SocialContentMedia({
  thumbnailUrl,
  title,
  contentType,
  provider,
  durationSeconds,
  aspectRatio = '4/5',
  priority = false,
  className = '',
  showBadges = true,
}: SocialContentMediaProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const isVideoFormat = ['REEL', 'SHORT', 'VIDEO'].includes(
    (contentType || '').toUpperCase()
  );

  const formatDuration = (seconds?: number | null) => {
    if (!seconds || seconds <= 0) return null;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const durationStr = formatDuration(durationSeconds);

  // Default fallback image
  const fallbackUrl =
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80';

  const imageSrc = hasError || !thumbnailUrl ? fallbackUrl : thumbnailUrl;

  let ratioClass = 'aspect-4/5';
  if (aspectRatio === '16/9') ratioClass = 'aspect-video';
  if (aspectRatio === '9/16') ratioClass = 'aspect-9/16';
  if (aspectRatio === '1/1') ratioClass = 'aspect-square';

  return (
    <div
      className={`relative w-full ${ratioClass} overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 shadow-xs group ${className}`}
    >
      {/* Media Image */}
      {thumbnailUrl && !hasError ? (
        <Image
          src={imageSrc}
          alt={title ? `Thumbnail: ${title}` : 'Social tourism story media'}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          priority={priority}
          loading={priority ? undefined : 'lazy'}
          onError={() => setHasError(true)}
          onLoad={() => setIsLoaded(true)}
          className={`object-cover w-full h-full transition-transform duration-500 ease-out group-hover:scale-105 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-gradient-to-br from-emerald-950/20 via-zinc-900/30 to-teal-950/20 text-zinc-400">
          <ImageOff className="w-8 h-8 mb-2 opacity-50" aria-hidden="true" />
          <span className="text-[11px] text-center font-medium line-clamp-2">
            {title || 'Chhattisgarh Heritage Story'}
          </span>
        </div>
      )}

      {/* Dark gradient scrim at top and bottom for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

      {/* Top Badges Bar */}
      {showBadges && (
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 pointer-events-none z-10">
          <div className="flex items-center gap-1.5">
            <SocialContentTypeBadge contentType={contentType} />
          </div>
          {provider && <SocialPlatformBadge platform={provider} />}
        </div>
      )}

      {/* Video Play Indicator Overlay */}
      {isVideoFormat && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="w-11 h-11 rounded-full bg-white/90 dark:bg-zinc-900/90 text-forest-emerald dark:text-emerald-400 flex items-center justify-center shadow-lg shadow-black/25 backdrop-blur-xs transition-transform duration-300 group-hover:scale-115 group-hover:bg-forest-emerald group-hover:text-white">
            <Play className="w-5 h-5 fill-current ml-0.5" aria-hidden="true" />
          </div>
        </div>
      )}

      {/* Duration Pill at bottom right */}
      {durationStr && (
        <div className="absolute bottom-2.5 right-2.5 z-10 pointer-events-none">
          <span className="px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-xs text-[11px] font-mono font-medium text-white shadow-xs">
            {durationStr}
          </span>
        </div>
      )}
    </div>
  );
}
