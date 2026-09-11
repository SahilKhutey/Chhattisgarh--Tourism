'use client';

import React from 'react';
import { Compass, Sparkles, MapPin, Mountain, Church, Trees, Footprints } from 'lucide-react';
import type { SearchResult, SearchFacet } from '@/lib/api/search';
import { SearchResultCard } from './SearchResultCard';

interface DiscoveryLandingProps {
  locale: string;
  featuredDestinations: SearchResult[];
  popularCategories: SearchFacet[];
  popularDistricts: SearchFacet[];
  onSelectCategory: (category: string) => void;
  onSelectDistrict: (district: string) => void;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  nature: <Mountain className="h-5 w-5 text-emerald-600" aria-hidden="true" />,
  waterfall: <Mountain className="h-5 w-5 text-blue-600" aria-hidden="true" />,
  spiritual: <Church className="h-5 w-5 text-amber-600" aria-hidden="true" />,
  temple: <Church className="h-5 w-5 text-amber-600" aria-hidden="true" />,
  wildlife: <Trees className="h-5 w-5 text-green-600" aria-hidden="true" />,
  heritage: <Compass className="h-5 w-5 text-indigo-600" aria-hidden="true" />,
  adventure: <Footprints className="h-5 w-5 text-rose-600" aria-hidden="true" />,
};

export function DiscoveryLanding({
  locale,
  featuredDestinations,
  popularCategories,
  popularDistricts,
  onSelectCategory,
  onSelectDistrict,
}: DiscoveryLandingProps) {
  return (
    <div className="space-y-12 my-8">
      {/* Categories Grid */}
      <section aria-labelledby="heading-categories">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-emerald-600" aria-hidden="true" />
          <h2
            id="heading-categories"
            className="text-lg font-bold text-slate-900 dark:text-slate-100"
          >
            Explore by Category
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { key: 'nature', label: 'Nature & Falls' },
            { key: 'heritage', label: 'Heritage' },
            { key: 'spiritual', label: 'Spiritual' },
            { key: 'wildlife', label: 'Wildlife' },
            { key: 'adventure', label: 'Adventure' },
            { key: 'experiences', label: 'Culture & Crafts' },
          ].map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => onSelectCategory(cat.key)}
              className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-500 hover:shadow-sm transition-all group text-center"
            >
              <div className="p-2.5 rounded-full bg-slate-50 dark:bg-slate-800 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/40 transition-colors mb-2">
                {CATEGORY_ICONS[cat.key] || (
                  <Compass className="h-5 w-5 text-emerald-600" aria-hidden="true" />
                )}
              </div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                {cat.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Featured Destinations */}
      {featuredDestinations.length > 0 && (
        <section aria-labelledby="heading-featured">
          <div className="flex items-center justify-between mb-4">
            <h2
              id="heading-featured"
              className="text-lg font-bold text-slate-900 dark:text-slate-100"
            >
              Featured Destinations
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Hand-picked verified tourism spots
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredDestinations.map((item) => (
              <SearchResultCard key={item.id} result={item} locale={locale} />
            ))}
          </div>
        </section>
      )}

      {/* Popular Districts */}
      {popularDistricts.length > 0 && (
        <section aria-labelledby="heading-districts">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-emerald-600" aria-hidden="true" />
            <h2
              id="heading-districts"
              className="text-lg font-bold text-slate-900 dark:text-slate-100"
            >
              Popular Tourism Districts
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {popularDistricts.map((d) => (
              <button
                key={d.value}
                type="button"
                onClick={() => onSelectDistrict(d.value)}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-600 transition-colors"
              >
                {d.value}
                <span className="ml-2 text-slate-400">({d.count})</span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
