import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Compass, ArrowRight } from 'lucide-react';
import { getPlaceSocialFeed } from '@/lib/social/api';
import { getSocialTemplate } from '@/lib/social/templates';
import {
  SocialShell,
  SocialBreadcrumbs,
  SocialBackButton,
  SocialFeed,
  SocialPrimaryButton,
} from '@/components/social';

interface PlaceSocialPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PlaceSocialPageProps): Promise<Metadata> {
  const { slug } = await params;
  const placeName = slug
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');
  return {
    title: `${placeName} | Creator Stories & Reels | Chhattisgarh Tourism`,
    description: `Real-time reels, photography, and traveler perspectives from ${placeName}, Chhattisgarh.`,
  };
}

export default async function PlaceSocialPage({
  params,
}: PlaceSocialPageProps) {
  const { slug } = await params;
  const feedRes = await getPlaceSocialFeed(slug, { limit: 16 });

  const firstItem = feedRes.items[0];
  const placeTitle =
    firstItem?.place_name ||
    slug
      .split('-')
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(' ');

  const district = firstItem?.district_id || 'Chhattisgarh';
  const template = getSocialTemplate('standard-grid');

  return (
    <main className="py-6 sm:py-10">
      <SocialShell>
        <div className="flex flex-col gap-8">
          {/* Navigation Breadcrumbs & Back */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <SocialBreadcrumbs
              items={[
                { label: 'Destinations', href: '/destinations' },
                { label: district, href: `/social/districts/${district.toLowerCase()}` },
                { label: placeTitle },
              ]}
            />

            <div className="flex items-center gap-2">
              <SocialBackButton fallbackHref="/social/feed" label="Back to Feed" />
              <Link href={`/destinations/${slug}`}>
                <SocialPrimaryButton
                  size="sm"
                  icon={<Compass className="w-3.5 h-3.5" />}
                >
                  Destination Guide
                </SocialPrimaryButton>
              </Link>
            </div>
          </div>

          {/* Place Header Banner */}
          <section
            aria-label="Destination Social Header"
            className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
          >
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20 mb-2 capitalize">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>{district} District</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
                {placeTitle}
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Curated reels, video trails, and travel photography captured at {placeTitle}.
              </p>
            </div>

            <div className="px-4 py-2 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              {feedRes.items.length} Stories Tagged
            </div>
          </section>

          {/* Stories Grid */}
          <section aria-label="Place Stories" className="flex flex-col gap-6">
            <SocialFeed
              template={template}
              items={feedRes.items}
              hasMore={Boolean(feedRes.next_cursor)}
            />
          </section>
        </div>
      </SocialShell>
    </main>
  );
}
