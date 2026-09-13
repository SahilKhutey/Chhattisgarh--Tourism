"use client";

import React from 'react';
import Image from 'next/image';
import { BadgeCheck, MapPin, Users, Eye, Sparkles } from 'lucide-react';

export interface CreatorCardData {
  id: string;
  name: string;
  avatarUrl?: string | null;
  district: string;
  bio?: string | null;
  creatorStatus: 'PENDING' | 'VERIFIED' | 'SUSPENDED' | 'REJECTED';
  verified: boolean;
  followersCount: number;
  viewsCount: number;
  categories?: string[];
}

interface CreatorCardProps {
  creator: CreatorCardData;
  onFollow?: (creatorId: string) => void;
  isFollowing?: boolean;
}

export const CreatorCard: React.FC<CreatorCardProps> = ({
  creator,
  onFollow,
  isFollowing = false,
}) => {
  const isVerified = creator.verified && creator.creatorStatus === 'VERIFIED';

  return (
    <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm transition-all hover:shadow-md">
      {/* Top Header with Avatar & Badges */}
      <div className="flex items-start gap-4">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-emerald-100 dark:bg-emerald-950/40 border-2 border-emerald-500/30">
          {creator.avatarUrl ? (
            <Image
              src={creator.avatarUrl}
              alt={creator.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-bold text-emerald-700 dark:text-emerald-300 text-lg">
              {creator.name.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 truncate text-base">
              {creator.name}
            </h3>
            {isVerified ? (
              <span
                data-testid="verified-badge"
                className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
              >
                <BadgeCheck className="h-3.5 w-3.5" />
                Verified
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400 border border-amber-500/20">
                Pending Verification
              </span>
            )}
          </div>

          <div className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{creator.district} District</span>
          </div>
        </div>
      </div>

      {/* Bio */}
      {creator.bio && (
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300 line-clamp-2">
          {creator.bio}
        </p>
      )}

      {/* Categories / Tags */}
      {creator.categories && creator.categories.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {creator.categories.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className="rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-xs text-zinc-600 dark:text-zinc-300"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Metrics & Action Footer */}
      <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {creator.followersCount.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            {creator.viewsCount.toLocaleString()}
          </span>
        </div>

        {onFollow && (
          <button
            onClick={() => onFollow(creator.id)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              isFollowing
                ? 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            {isFollowing ? 'Following' : 'Follow'}
          </button>
        )}
      </div>
    </div>
  );
};
