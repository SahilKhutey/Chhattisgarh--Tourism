'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle2, User, MapPin } from 'lucide-react';
import { SocialCreator } from '@/lib/social/types';

interface SocialCreatorCardProps {
  creator: SocialCreator;
  className?: string;
  variant?: 'vertical' | 'compact' | 'pill';
}

export function SocialCreatorCard({
  creator,
  className = '',
  variant = 'vertical',
}: SocialCreatorCardProps) {
  if (variant === 'pill') {
    return (
      <Link
        href={`/social/creators/${creator.handle}`}
        className={`inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/50 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-all shrink-0 shadow-2xs group focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${className}`}
        aria-label={`View creator profile of ${creator.display_name}`}
      >
        {creator.avatar_url ? (
          <div className="relative w-6 h-6 rounded-full overflow-hidden shrink-0 border border-emerald-500/30">
            <Image
              src={creator.avatar_url}
              alt={creator.display_name}
              fill
              sizes="24px"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
            <User className="w-3 h-3" />
          </div>
        )}
        <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-forest-emerald dark:group-hover:text-emerald-400 truncate max-w-[120px]">
          {creator.display_name}
        </span>
        {creator.is_verified && (
          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
        )}
      </Link>
    );
  }

  return (
    <Link
      href={`/social/creators/${creator.handle}`}
      className={`flex flex-col items-center text-center p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 hover:border-emerald-500/50 hover:shadow-lg transition-all group focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${className}`}
      aria-label={`View creator ${creator.display_name} from ${creator.district_id || 'Chhattisgarh'}`}
    >
      <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-full overflow-hidden border-2 border-emerald-500/40 p-0.5 mb-3 group-hover:scale-105 transition-transform duration-300">
        {creator.avatar_url ? (
          <div className="relative w-full h-full rounded-full overflow-hidden">
            <Image
              src={creator.avatar_url}
              alt={creator.display_name}
              fill
              sizes="72px"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-full h-full rounded-full bg-emerald-500/10 text-emerald-700 flex items-center justify-center">
            <User className="w-8 h-8" />
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 mb-1">
        <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-forest-emerald dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
          {creator.display_name}
        </h4>
        {creator.is_verified && (
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        )}
      </div>

      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mb-2 truncate max-w-[130px]">
        @{creator.handle}
      </p>

      {creator.district_id && (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 dark:text-emerald-300 bg-emerald-500/10 px-2.5 py-0.5 rounded-full capitalize mb-2">
          <MapPin className="w-2.5 h-2.5" />
          <span>{creator.district_id}</span>
        </span>
      )}

      {creator.content_count !== undefined && (
        <span className="text-[10px] text-zinc-400 font-medium">
          {creator.content_count} regional stories
        </span>
      )}
    </Link>
  );
}
