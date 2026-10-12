import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle2, User, MapPin, ArrowLeft, Compass } from 'lucide-react';
import {
  getCreatorFeed,
  getPublicCreators,
} from '@/lib/social/api';
import { getSocialTemplate } from '@/lib/social/templates';
import { SocialFeed, SocialPlatformBadge } from '@/components/social';

interface CreatorPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: CreatorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const creators = await getPublicCreators();
  const creator = creators.find((c) => c.handle.toLowerCase() === slug.toLowerCase());

  const name = creator ? creator.display_name : slug;
  return {
    title: `${name} | Regional Tourism Creator | Chhattisgarh Tourism`,
    description: creator?.bio || `Stories, reels and photography by verified creator @${slug} in Chhattisgarh.`,
  };
}

export default async function CreatorFeedPage({ params }: CreatorPageProps) {
  const { slug } = await params;
  const [feedRes, creators] = await Promise.all([
    getCreatorFeed(slug, { limit: 20 }),
    getPublicCreators(),
  ]);

  const creator =
    creators.find((c) => c.handle.toLowerCase() === slug.toLowerCase()) ||
    (feedRes.items.length > 0 && feedRes.items[0].creator
      ? feedRes.items[0].creator
      : null);

  if (!creator && feedRes.items.length === 0) {
    notFound();
  }

  const displayName = creator?.display_name || slug;
  const handle = creator?.handle || slug;
  const template = getSocialTemplate('standard-grid');

  // Discover places featured by this creator
  const placesFeatured = Array.from(
    new Set(
      feedRes.items
        .map((i) => i.place_name || i.place_slug)
        .filter(Boolean)
    )
  );

  return (
    <main className="min-h-screen bg-sand-beige/40 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2">
          <Link
            href="/social/feed?tab=creators"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-forest-emerald transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Creators</span>
          </Link>
        </div>

        {/* Creator Hero Header */}
        <section
          aria-label="Creator Profile"
          className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-6"
        >
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-emerald-500/40 shrink-0 p-1 bg-white dark:bg-zinc-800">
            {creator?.avatar_url ? (
              <div className="relative w-full h-full rounded-full overflow-hidden">
                <Image
                  src={creator.avatar_url}
                  alt={displayName}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-full h-full rounded-full bg-emerald-500/10 text-emerald-700 flex items-center justify-center">
                <User className="w-10 h-10" />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {displayName}
              </h1>
              {creator?.is_verified && (
                <CheckCircle2
                  className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0"
                  aria-label="Verified Creator"
                />
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              <span>@{handle}</span>
              {creator?.district_id && (
                <>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 font-medium text-emerald-800 dark:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full capitalize">
                    <MapPin className="w-3 h-3" />
                    <span>{creator.district_id}</span>
                  </span>
                </>
              )}
              <span>•</span>
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                {feedRes.items.length} Stories Published
              </span>
            </div>

            {creator?.bio && (
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl mt-1">
                {creator.bio}
              </p>
            )}

            {/* Platforms badging */}
            {creator?.platforms && creator.platforms.length > 0 && (
              <div className="flex items-center gap-2 mt-2">
                {creator.platforms.map((p) => (
                  <SocialPlatformBadge key={p} platform={p} size="sm" />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Featured Locations by this Creator */}
        {placesFeatured.length > 0 && (
          <section
            aria-label="Destinations Featured"
            className="flex items-center gap-2 flex-wrap text-xs text-zinc-500"
          >
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
              Locations featured:
            </span>
            {placesFeatured.map((p) => (
              <span
                key={String(p)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 capitalize font-medium"
              >
                <Compass className="w-3 h-3 text-emerald-600" />
                <span>{String(p).replace(/-/g, ' ')}</span>
              </span>
            ))}
          </section>
        )}

        {/* Creator Content Feed */}
        <section aria-label="Creator Stories" className="flex flex-col gap-6">
          <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Stories by {displayName}
            </h2>
          </div>

          <SocialFeed
            template={template}
            items={feedRes.items}
            hasMore={Boolean(feedRes.next_cursor)}
          />
        </section>
      </div>
    </main>
  );
}
