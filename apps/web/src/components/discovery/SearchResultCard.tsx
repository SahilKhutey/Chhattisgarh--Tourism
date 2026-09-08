'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Tag, Compass, Calendar } from 'lucide-react';
import { DiscoveryResult } from '../../lib/discovery/types';

interface SearchResultCardProps {
  item: DiscoveryResult;
}

export function SearchResultCard({ item }: SearchResultCardProps) {
  // Polymorphically extract a thumbnail if any image field exists in data
  const imageUrl = extractThumbnail(item.data);

  return (
    <article className="group bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between">
      <div>
        {/* Thumbnail or decorative gradient banner */}
        {imageUrl ? (
          <div className="relative aspect-video w-full overflow-hidden bg-stone-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-3 left-3">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/95 text-stone-800 shadow-sm backdrop-blur-sm">
                {item.templateName}
              </span>
            </div>
          </div>
        ) : (
          <div className="h-20 bg-gradient-to-br from-emerald-700 to-stone-900 p-3 flex items-start justify-between">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white backdrop-blur-sm">
              {item.templateName}
            </span>
            <Compass className="w-5 h-5 text-white/40" />
          </div>
        )}

        {/* Content Details */}
        <div className="p-5 space-y-3">
          <h3 className="text-base font-bold text-stone-900 group-hover:text-emerald-700 transition-colors line-clamp-2">
            <Link href={`/content/${item.templateSlug}/${item.slug}`}>
              {item.title}
            </Link>
          </h3>

          {/* Location Badge */}
          {(item.district || item.region) && (
            <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>
                {[item.district, item.region].filter(Boolean).join(', ')}
              </span>
            </div>
          )}

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {item.tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-100 text-[10px] font-medium text-stone-600"
                >
                  <Tag className="w-2.5 h-2.5 text-stone-400" />
                  {tag}
                </span>
              ))}
              {item.tags.length > 3 && (
                <span className="text-[10px] text-stone-400 font-medium self-center">
                  +{item.tags.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-5 py-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-xs">
        <span className="text-stone-400 font-mono text-[11px]">
          /{item.templateSlug}/{item.slug}
        </span>
        <Link
          href={`/content/${item.templateSlug}/${item.slug}`}
          className="font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
        >
          Explore &rarr;
        </Link>
      </div>
    </article>
  );
}

function extractThumbnail(data: Record<string, unknown>): string | null {
  if (!data || typeof data !== 'object') return null;

  for (const [key, val] of Object.entries(data)) {
    if (typeof val === 'string' && (val.startsWith('http://') || val.startsWith('https://'))) {
      if (key.toLowerCase().includes('image') || key.toLowerCase().includes('hero') || key.toLowerCase().includes('photo')) {
        return val;
      }
    }
    if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'string' && val[0].startsWith('http')) {
      return val[0];
    }
  }

  return null;
}

export default SearchResultCard;
