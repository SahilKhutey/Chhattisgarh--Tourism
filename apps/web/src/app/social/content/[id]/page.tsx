import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  MapPin,
  Compass,
  Calendar,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import {
  getSocialContentById,
  getDistrictSocialFeed,
} from '@/lib/social/api';
import { getSocialTemplate } from '@/lib/social/templates';
import {
  SocialShell,
  SocialBreadcrumbs,
  SocialBackButton,
  SocialContentMedia,
  SocialSourceButton,
  SocialPlatformBadge,
  SocialContentTypeBadge,
  SocialFeed,
  SocialPrimaryButton,
} from '@/components/social';

interface ContentDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: ContentDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const item = await getSocialContentById(id);
    return {
      title: `${item.title} | Chhattisgarh Tourism Social`,
      description: item.caption || item.description || `Regional story from ${item.district_id}`,
      openGraph: {
        title: item.title,
        description: item.caption,
        images: item.thumbnail_url ? [item.thumbnail_url] : [],
      },
    };
  } catch {
    return {
      title: 'Story | Chhattisgarh Tourism',
    };
  }
}

export default async function ContentDetailPage({
  params,
}: ContentDetailPageProps) {
  const { id } = await params;

  let content;
  try {
    content = await getSocialContentById(id);
  } catch {
    notFound();
  }

  // Load related regional content
  const relatedRes = await getDistrictSocialFeed(content.district_id, {
    limit: 4,
  });
  const relatedItems = relatedRes.items.filter((i) => i.id !== content.id).slice(0, 4);
  const compactTemplate = getSocialTemplate('compact-grid');

  return (
    <main className="py-6 sm:py-10">
      <SocialShell maxWidth="5xl">
        <div className="flex flex-col gap-6">
          {/* Breadcrumbs and Back Navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <SocialBreadcrumbs
              items={[
                { label: 'Feed', href: '/social/feed' },
                {
                  label: content.district_id.charAt(0).toUpperCase() + content.district_id.slice(1),
                  href: `/social/districts/${content.district_id}`,
                },
                { label: content.title },
              ]}
            />
            <SocialBackButton fallbackHref="/social/feed" />
          </div>

          {/* Content Card Presentation */}
          <article
            aria-labelledby="story-title"
            className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-5 sm:p-8 shadow-sm flex flex-col md:flex-row gap-8 items-start"
          >
            {/* Media Player Container */}
            <div className="w-full md:w-1/2 shrink-0">
              <SocialContentMedia
                thumbnailUrl={content.thumbnail_url}
                title={content.title}
                contentType={content.content_type}
                provider={content.provider}
                durationSeconds={content.duration_seconds}
                aspectRatio="4/5"
                priority={true}
                showBadges={false}
                className="rounded-2xl shadow-md"
              />
            </div>

            {/* Context & Tourism Metadata */}
            <div className="flex flex-col gap-5 w-full md:w-1/2">
              {/* Top Badges */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <SocialContentTypeBadge type={content.content_type} size="md" />
                  {content.provider && (
                    <SocialPlatformBadge platform={content.provider} size="md" />
                  )}
                </div>

                {content.published_at && (
                  <span className="text-xs text-zinc-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {new Date(content.published_at).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </span>
                )}
              </div>

              {/* Title & Caption */}
              <div className="flex flex-col gap-2">
                <h1
                  id="story-title"
                  className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50 leading-snug"
                >
                  {content.title}
                </h1>

                {content.caption && (
                  <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                    {content.caption}
                  </p>
                )}
              </div>

              {/* Creator Attribution */}
              {content.creator && (
                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-between gap-3">
                  <Link
                    href={`/social/creators/${content.creator.handle}`}
                    className="flex items-center gap-2.5 min-w-0 group"
                  >
                    <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-800 flex items-center justify-center font-bold text-sm">
                      {content.creator.display_name.charAt(0)}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-forest-emerald transition-colors truncate">
                        {content.creator.display_name}
                      </span>
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        @{content.creator.handle}
                      </span>
                    </div>
                  </Link>

                  <Link
                    href={`/social/creators/${content.creator.handle}`}
                    className="text-xs font-semibold text-forest-emerald hover:underline shrink-0"
                  >
                    View Profile
                  </Link>
                </div>
              )}

              {/* Outbound Open Source Action */}
              <div className="pt-2">
                <SocialSourceButton
                  sourceUrl={content.source_url}
                  provider={content.provider}
                  contentId={content.id}
                  actionLabel={content.original_platform_action_label}
                  variant="primary"
                  className="w-full py-3 text-sm font-bold"
                />
              </div>

              {/* Tourism Graph Context Box */}
              <div className="rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-500/30 p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-forest-emerald dark:text-emerald-300">
                  <Compass className="w-4 h-4" />
                  <h2 className="text-xs font-bold uppercase tracking-wider">
                    Tourism Destination Context
                  </h2>
                </div>

                <div className="flex flex-col gap-1.5 text-xs text-zinc-700 dark:text-zinc-300">
                  {content.place_name && (
                    <div className="flex items-center gap-1.5 font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Place: {content.place_name}</span>
                    </div>
                  )}
                  <div className="capitalize text-zinc-600 dark:text-zinc-400">
                    District: {content.district_id}
                  </div>
                  {content.festival_name && (
                    <div className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400">
                      <Sparkles className="w-3 h-3" />
                      <span>Festival: {content.festival_name}</span>
                    </div>
                  )}
                </div>

                {content.place_slug && (
                  <div className="flex flex-col gap-2">
                    <Link href={`/destinations/${content.place_slug}`}>
                      <SocialPrimaryButton
                        className="w-full justify-center"
                        icon={<ArrowRight className="w-4 h-4 order-last" />}
                      >
                        Explore Destination Guide
                      </SocialPrimaryButton>
                    </Link>
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href={`/map?place=${content.place_slug}`}
                        className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors"
                      >
                        <Compass className="w-3.5 h-3.5 text-forest-emerald" />
                        <span>View on Map</span>
                      </Link>
                      <Link
                        href={`/itineraries?destination=${content.place_slug}`}
                        className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors"
                      >
                        <Calendar className="w-3.5 h-3.5 text-warm-orange" />
                        <span>Plan Itinerary</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </article>

          {/* Related Stories from this Region */}
          {relatedItems.length > 0 && (
            <section
              aria-label="Related Regional Stories"
              className="flex flex-col gap-4 pt-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  More Stories from {content.district_id.charAt(0).toUpperCase() + content.district_id.slice(1)}
                </h2>
                <Link
                  href={`/social/districts/${content.district_id}`}
                  className="text-xs font-semibold text-forest-emerald hover:underline"
                >
                  View District Feed →
                </Link>
              </div>

              <SocialFeed
                template={compactTemplate}
                items={relatedItems}
              />
            </section>
          )}
        </div>
      </SocialShell>
    </main>
  );
}
