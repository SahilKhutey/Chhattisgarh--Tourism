import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, MapPin, Compass, ArrowRight } from 'lucide-react';
import {
  getDistrictSocialFeed,
  getPublicCreators,
} from '@/lib/social/api';
import { getSocialTemplate } from '@/lib/social/templates';
import {
  SocialFeed,
  SocialCreatorStrip,
} from '@/components/social';

interface DistrictSocialPageProps {
  params: Promise<{ slug: string }>;
}

const DISTRICT_NAMES: Record<string, string> = {
  bastar: 'Bastar (Jagdalpur)',
  surguja: 'Surguja (Mainpat Highlands)',
  mahasamund: 'Mahasamund (Sirpur & Barnawapara)',
  dantewada: 'Dantewada',
  raipur: 'Raipur & Central Plains',
  bilaspur: 'Bilaspur',
};

export async function generateMetadata({
  params,
}: DistrictSocialPageProps): Promise<Metadata> {
  const { slug } = await params;
  const name = DISTRICT_NAMES[slug.toLowerCase()] || slug.charAt(0).toUpperCase() + slug.slice(1);
  return {
    title: `${name} Social Stories & Reels | Chhattisgarh Tourism`,
    description: `Discover living social stories, reels, and photos from local creators in ${name}, Chhattisgarh.`,
  };
}

export default async function DistrictSocialPage({
  params,
}: DistrictSocialPageProps) {
  const { slug } = await params;
  const normalizedDistrict = slug.toLowerCase();
  const districtName =
    DISTRICT_NAMES[normalizedDistrict] ||
    slug.charAt(0).toUpperCase() + slug.slice(1);

  const [feedRes, creators] = await Promise.all([
    getDistrictSocialFeed(normalizedDistrict, { limit: 16 }),
    getPublicCreators(normalizedDistrict, 10),
  ]);

  const regionalTemplate = getSocialTemplate('regional-showcase');

  return (
    <main className="min-h-screen bg-sand-beige/40 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/social/feed"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-forest-emerald transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Social Stories</span>
          </Link>

          <Link
            href={`/districts/${normalizedDistrict}`}
            className="text-xs font-semibold text-forest-emerald hover:underline inline-flex items-center gap-1"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>District Itinerary Guide →</span>
          </Link>
        </div>

        {/* District Banner */}
        <section
          aria-label="District Header"
          className="rounded-3xl bg-gradient-to-br from-forest-emerald via-emerald-950 to-zinc-900 text-white p-6 sm:p-10 border border-emerald-500/20 shadow-xl"
        >
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 mb-3">
              <MapPin className="w-3.5 h-3.5" />
              <span>District Social Showcase</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              {districtName}
            </h1>
            <p className="text-xs sm:text-base text-zinc-200 mt-2.5 leading-relaxed">
              Real-time stories, traditional craftsmanship, living festivals, and scenic trails captured by creators across {districtName}.
            </p>
          </div>
        </section>

        {/* District Creators Strip */}
        {creators.length > 0 && (
          <SocialCreatorStrip
            creators={creators}
            showTitle={true}
          />
        )}

        {/* Regional Content Showcase */}
        <section aria-label="District Stories" className="flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Regional Showcase Feed
            </h2>
            <span className="text-xs text-zinc-500">
              {feedRes.items.length} verified stories
            </span>
          </div>

          <SocialFeed
            template={regionalTemplate}
            items={feedRes.items}
            hasMore={Boolean(feedRes.next_cursor)}
          />
        </section>
      </div>
    </main>
  );
}
