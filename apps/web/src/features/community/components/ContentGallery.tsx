"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Play, Sparkles, MapPin, ShieldCheck, Clock, AlertTriangle } from 'lucide-react';

export interface CreatorContentItem {
  id: string;
  type: string;
  title: string;
  description?: string | null;
  mediaUrl?: string | null;
  location?: string | null;
  moderationStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  creatorName: string;
  publishedAt?: string | null;
}

interface ContentGalleryProps {
  items: CreatorContentItem[];
  onSelect?: (item: CreatorContentItem) => void;
}

export const ContentGallery: React.FC<ContentGalleryProps> = ({
  items,
  onSelect,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'APPROVED' | 'PENDING'>('ALL');

  const filteredItems = items.filter((item) => {
    if (filter === 'ALL') return true;
    return item.moderationStatus === filter;
  });

  return (
    <div className="flex flex-col gap-5">
      {/* Moderation Filter Controls */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          {(['ALL', 'APPROVED', 'PENDING'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === status
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              {status === 'ALL' ? 'All Stories' : status === 'APPROVED' ? 'Verified Published' : 'In Moderation'}
            </button>
          ))}
        </div>
        <span className="text-xs text-zinc-500">
          Showing {filteredItems.length} {filteredItems.length === 1 ? 'story' : 'stories'}
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelect?.(item)}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            {/* Media thumbnail */}
            <div className="relative aspect-video w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
              {item.mediaUrl ? (
                <Image
                  src={item.mediaUrl}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-800 to-zinc-900 text-white/40">
                  <Play className="h-10 w-10 stroke-1" />
                </div>
              )}

              {/* Moderation Status Badge */}
              <div className="absolute top-2.5 right-2.5">
                {item.moderationStatus === 'APPROVED' ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600/90 backdrop-blur-md px-2.5 py-0.5 text-xs font-medium text-white shadow-sm">
                    <ShieldCheck className="h-3 w-3" />
                    Verified
                  </span>
                ) : item.moderationStatus === 'PENDING' ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-600/90 backdrop-blur-md px-2.5 py-0.5 text-xs font-medium text-white shadow-sm">
                    <Clock className="h-3 w-3" />
                    In Review
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-600/90 backdrop-blur-md px-2.5 py-0.5 text-xs font-medium text-white shadow-sm">
                    <AlertTriangle className="h-3 w-3" />
                    Flagged
                  </span>
                )}
              </div>

              {/* Type tag */}
              <span className="absolute bottom-2.5 left-2.5 rounded-md bg-black/60 backdrop-blur-md px-2 py-0.5 text-[11px] font-medium text-white">
                {item.type}
              </span>
            </div>

            {/* Content Details */}
            <div className="p-4 flex flex-col flex-1 justify-between">
              <div>
                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {item.title}
                </h4>
                {item.description && (
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>

              <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500">
                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  By {item.creatorName}
                </span>
                {item.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {item.location}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
