import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Compass, Sparkles, MapPin, ArrowRight, ShieldCheck } from 'lucide-react';
import {
  getSocialFeed,
  getPublicCreators,
} from '@/lib/social/api';
import { getSocialTemplate } from '@/lib/social/templates';
import {
  SocialShell,
  SocialSectionNav,
  SocialFeedHeader,
  SocialCreatorStrip,
  SocialFeaturedContent,
  SocialFeed,
  SocialPrimaryButton,
  SocialSecondaryButton,
} from '@/components/social';

export const metadata: Metadata = {
  title: 'Social Stories & Regional Living Feed | Chhattisgarh Tourism',
  description:
    'Discover Chhattisgarh through verified local creators, guides, and travelers. Experience authentic waterfalls, tribal craft traditions, and hidden wildlife trails.',
  openGraph: {
    title: 'Social Stories | Chhattisgarh Tourism',
    description:
      'Living regional tourism discovery across 33 districts of Chhattisgarh.',
  },
};

export default async function SocialHomePage() {
  const [feedRes, creators] = await Promise.all([
    getSocialFeed({ limit: 12, enableDiversity: true }),
    getPublicCreators(undefined, 8),
  ]);

  const featuredItems = feedRes.items.filter((i) => i.is_featured);
  const regularItems = feedRes.items.filter((i) => !i.is_featured);
  const displayItems = regularItems.length > 0 ? regularItems : feedRes.items;
  const standardTemplate = getSocialTemplate('standard-grid');

  return (
    <div className="flex flex-col w-full">
      {/* Category Sub-navigation */}
      <SocialSectionNav activeId="all" />

      <main className="py-6 sm:py-10">
        <SocialShell>
          <div className="flex flex-col gap-10">
            {/* Living Regional Feed Banner */}
            <section
              aria-label="Welcome banner"
              className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-forest-emerald via-emerald-950 to-zinc-900 text-white p-6 sm:p-10 border border-emerald-500/20 shadow-xl"
            >
              <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 mb-3 backdrop-blur-md">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Living Regional Discovery</span>
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-sans">
                    Chhattisgarh in Motion
                  </h1>
                  <p className="text-xs sm:text-base text-zinc-200 mt-2.5 leading-relaxed">
                    Experience real-time stories, vertical reels, and verified oral folklore shared by local guides across all 33 districts. Every story is a doorway into regional destination planning.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <Link href="/social/feed">
                    <SocialPrimaryButton
                      icon={<ArrowRight className="w-4 h-4 order-last" />}
                    >
                      Browse Full Feed
                    </SocialPrimaryButton>
                  </Link>

                  <Link href="/destinations">
                    <SocialSecondaryButton
                      icon={<Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                    >
                      Destinations
                    </SocialSecondaryButton>
                  </Link>
                </div>
              </div>
            </section>

            {/* Creator Discovery Strip */}
            <SocialCreatorStrip creators={creators} />

            {/* Featured Stories Spotlight */}
            {featuredItems.length > 0 && (
              <SocialFeaturedContent items={featuredItems} />
            )}

            {/* Latest Regional Stories Section */}
            <section aria-label="Latest Regional Stories" className="flex flex-col gap-6">
              <SocialFeedHeader
                title="Latest Regional Stories"
                subtitle="Recent discoveries and travel moments across Bastar, Surguja, Sirpur, and beyond."
                badge="Fresh Perspectives"
                creatorLink={false}
              />

              <SocialFeed
                template={standardTemplate}
                items={displayItems}
                hasMore={Boolean(feedRes.next_cursor)}
              />
            </section>

            {/* Explore Districts Quick Grid */}
            <section
              aria-label="Explore Regional Districts"
              className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 flex flex-col gap-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    Explore Stories by District
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Filter by regional topography, tribal culture, and wildlife habitats
                  </p>
                </div>
                <Link
                  href="/destinations"
                  className="text-xs font-semibold text-forest-emerald hover:underline inline-flex items-center gap-1"
                >
                  <span>All 33 Districts</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {[
                  { id: 'bastar', name: 'Bastar', desc: 'Waterfalls & Dhokra Craft' },
                  { id: 'surguja', name: 'Surguja', desc: 'Mainpat & Highland Plateaus' },
                  { id: 'mahasamund', name: 'Mahasamund', desc: 'Sirpur & Barnawapara Safari' },
                  { id: 'dantewada', name: 'Dantewada', desc: 'Danteshwari & Sacred Heritage' },
                ].map((d) => (
                  <Link
                    key={d.id}
                    href={`/social/districts/${d.id}`}
                    className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 border border-zinc-200 dark:border-zinc-700/60 transition-all group"
                  >
                    <div className="flex items-center gap-1.5 text-forest-emerald dark:text-emerald-400 mb-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="text-xs font-bold">{d.name}</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1">
                      {d.desc}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </SocialShell>
      </main>
    </div>
  );
}
