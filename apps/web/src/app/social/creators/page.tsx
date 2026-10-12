import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Users, Sparkles, Compass, ShieldCheck } from 'lucide-react';
import { getPublicCreators } from '@/lib/social/api';
import {
  SocialShell,
  SocialBreadcrumbs,
  SocialCreatorCard,
} from '@/components/social';

export const metadata: Metadata = {
  title: 'Verified Regional Creators & Local Guides | Chhattisgarh Tourism',
  description:
    'Discover official and verified storytellers, regional photographers, and cultural chroniclers across all 33 districts of Chhattisgarh.',
  openGraph: {
    title: 'Verified Creators | Chhattisgarh Tourism Social',
    description:
      'Explore Chhattisgarh through the eyes of verified local creators and guides.',
  },
};

export default async function CreatorsIndexPage() {
  const creators = await getPublicCreators(undefined, 50);

  return (
    <main className="py-6 sm:py-10">
      <SocialShell>
        <div className="flex flex-col gap-8">
          {/* Breadcrumb Trail */}
          <SocialBreadcrumbs
            items={[{ label: 'Creators', href: '/social/creators' }]}
          />

          {/* Header Banner */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-forest-emerald via-emerald-950 to-zinc-900 text-white p-6 sm:p-10 border border-emerald-500/20 shadow-xl">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 mb-3 backdrop-blur-md">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verified Creator Registry</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                  Regional Storytellers & Guides
                </h1>
                <p className="text-xs sm:text-base text-zinc-200 mt-2.5 leading-relaxed">
                  Meet the local voices documenting authentic folk traditions, remote waterfalls, temple architecture, and wildlife reserves across Chhattisgarh.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Link
                  href="/social/feed"
                  className="px-5 py-3 rounded-2xl bg-white hover:bg-zinc-100 text-forest-emerald font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-transform active:scale-95"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Browse Living Feed</span>
                </Link>
              </div>
            </div>
          </section>

          {/* Creators Grid */}
          <section aria-label="Creators Directory" className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Users className="w-5 h-5 text-forest-emerald" />
                <span>All Verified Creators ({creators.length})</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {creators.map((creator) => (
                <SocialCreatorCard key={creator.id} creator={creator} />
              ))}
            </div>
          </section>
        </div>
      </SocialShell>
    </main>
  );
}
