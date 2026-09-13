"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  Compass,
  MapPin,
  Navigation,
  Layers,
  Map as MapIcon,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { SearchBar } from '@/features/discovery/components/SearchBar';
import { SearchFilters } from '@/features/discovery/components/SearchFilters';
import { SearchResults } from '@/features/discovery/components/SearchResults';
import { NearbyPlaces } from '@/features/discovery/components/NearbyPlaces';
import { useDiscoverySearch } from '@/features/discovery/hooks/useDiscoverySearch';
import { DiscoveryPlace } from '@/features/discovery/api/discovery-api';

const DiscoveryMap = dynamic(
  () => import('@/features/discovery/components/DiscoveryMap'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[450px] flex flex-col items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded-2xl gap-3 animate-pulse">
        <div className="w-10 h-10 rounded-full border-4 border-emerald-600/20 border-t-emerald-600 animate-spin" />
        <p className="text-xs font-mono text-zinc-500 font-medium">Loading Chhattisgarh Interactive Map…</p>
      </div>
    ),
  },
);

const REGIONAL_DIVISIONS = [
  { name: 'Bastar Division', slug: 'bastar', color: 'from-amber-600 to-orange-700', desc: 'Waterfalls, tribal culture & Dandakaranya forests' },
  { name: 'Raipur Division', slug: 'raipur', color: 'from-emerald-600 to-teal-700', desc: 'State capital, Sirpur Buddhist sites & Mahanadi basin' },
  { name: 'Bilaspur Division', slug: 'bilaspur', color: 'from-blue-600 to-indigo-700', desc: 'Achanakmar Tiger Reserve & Ratanpur historical temples' },
  { name: 'Durg Division', slug: 'durg', color: 'from-purple-600 to-pink-700', desc: 'Maikal hills, Maitri Bagh & colonial architecture' },
  { name: 'Surguja Division', slug: 'surguja', color: 'from-green-600 to-emerald-800', desc: 'Mainpat Tibetan settlement, Ramgarh hills & coal belt' },
];

export default function ExplorePage() {
  const {
    query,
    setQuery,
    district,
    setDistrict,
    category,
    setCategory,
    results,
    total,
    loading,
    error,
    suggestions,
    selectSuggestion,
    executeSearch,
  } = useDiscoverySearch();

  const [activeTab, setActiveTab] = useState<'all' | 'map' | 'nearby'>('all');
  const [selectedPlace, setSelectedPlace] = useState<DiscoveryPlace | null>(null);

  const handlePlaceSelect = (place: DiscoveryPlace) => {
    setSelectedPlace(place);
    if (activeTab !== 'map') {
      // If user clicks on card, optionally switch or keep in context
    }
  };

  const handleResetFilters = () => {
    setQuery('');
    setCategory(undefined);
    setDistrict(undefined);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* Hero Search Header */}
      <section className="relative border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 pt-12 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 px-3.5 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-300 mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            CG Tourism OS — Consumer Discovery & Geographic Intelligence
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
            Discover the Soul of <span className="text-emerald-600 dark:text-emerald-400">Chhattisgarh</span>
          </h1>

          <p className="mt-3 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl">
            Explore 33 districts, ancient tribal folklore, roaring waterfalls, Buddhist heritage trails, and verified eco-stays.
          </p>

          {/* Search Bar */}
          <div className="mt-8 w-full max-w-2xl">
            <SearchBar
              value={query}
              onChange={setQuery}
              onSubmit={executeSearch}
              suggestions={suggestions}
              onSelectSuggestion={selectSuggestion}
            />
          </div>

          {/* Filter Bar */}
          <div className="mt-5 w-full max-w-3xl">
            <SearchFilters
              selectedCategory={category}
              onSelectCategory={setCategory}
              selectedDistrict={district}
              onSelectDistrict={setDistrict}
              onReset={handleResetFilters}
            />
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 sticky top-0 z-20 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2 py-3 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                activeTab === 'all'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Compass className="h-4 w-4" />
              Destinations ({total})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('map')}
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                activeTab === 'map'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <MapIcon className="h-4 w-4" />
              Interactive Map
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('nearby')}
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                activeTab === 'nearby'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Navigation className="h-4 w-4" />
              Near Me
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'all' && (
          <div className="space-y-12">
            {/* Search Results Grid */}
            <section>
              <SearchResults
                places={results}
                total={total}
                loading={loading}
                error={error}
                selectedPlaceId={selectedPlace?.id}
                onSelectPlace={handlePlaceSelect}
                onRetry={executeSearch}
              />
            </section>

            {/* Explore by Administrative Division */}
            <section className="pt-8 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                    Explore by Administrative Division
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Navigate through Chhattisgarh's 5 official administrative headquarters
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {REGIONAL_DIVISIONS.map((div) => (
                  <div
                    key={div.slug}
                    onClick={() => setDistrict(div.slug)}
                    className="group cursor-pointer relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 transition-all hover:border-emerald-500 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {div.name}
                      </h3>
                      <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:text-emerald-600 transition-transform group-hover:translate-x-1" />
                    </div>
                    <p className="mt-2 text-xs text-zinc-500 line-clamp-2">
                      {div.desc}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'map' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[700px]">
            <div className="lg:col-span-2 h-full">
              <DiscoveryMap
                places={results}
                selectedPlace={selectedPlace}
                onSelectPlace={setSelectedPlace}
                className="h-full"
              />
            </div>
            <div className="overflow-y-auto pr-1 space-y-4">
              <h3 className="font-bold text-sm text-zinc-700 dark:text-zinc-300">
                Synchronized Places ({results.length})
              </h3>
              {results.map((place) => (
                <div
                  key={place.id}
                  onClick={() => setSelectedPlace(place)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    selectedPlace?.id === place.id
                      ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-xs'
                      : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300'
                  }`}
                >
                  <div className="text-[10px] font-semibold text-emerald-600">{place.district}</div>
                  <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{place.name}</div>
                  {place.shortDescription && (
                    <div className="text-xs text-zinc-500 line-clamp-1 mt-1">{place.shortDescription}</div>
                  )}
                  <Link
                    href={`/places/${place.slug}`}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-2 hover:underline"
                  >
                    View Destination
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'nearby' && (
          <NearbyPlaces
            selectedPlaceId={selectedPlace?.id}
            onSelectPlace={handlePlaceSelect}
          />
        )}
      </main>
    </div>
  );
}
