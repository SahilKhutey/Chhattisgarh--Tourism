'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { LayoutGrid, Map as MapIcon, Loader2, Compass } from 'lucide-react';
import { searchContent } from '../../lib/discovery/api';
import { DiscoveryResponse, DiscoveryResult } from '../../lib/discovery/types';
import { fetchTemplates } from '../../lib/template';
import { ContentTemplate } from '../../types/content';
import { SearchBar } from '../../components/discovery/SearchBar';
import { DiscoveryFilters } from '../../components/discovery/DiscoveryFilters';
import { SearchResults } from '../../components/discovery/SearchResults';
import { Pagination } from '../../components/discovery/Pagination';

// Dynamically import MapResults to avoid Leaflet SSR issues
const MapResults = dynamic(
  () => import('../../components/discovery/MapResults'),
  {
    ssr: false,
    loading: () => (
      <div className="h-[500px] bg-stone-100 rounded-2xl flex items-center justify-center text-xs text-stone-400">
        Loading interactive map...
      </div>
    ),
  },
);

export default function DiscoverPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-stone-50 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
        </div>
      }
    >
      <DiscoverContent />
    </Suspense>
  );
}

function DiscoverContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read URL query parameters
  const q = searchParams.get('q') || '';
  const templateId = searchParams.get('templateId') || undefined;
  const region = searchParams.get('region') || undefined;
  const district = searchParams.get('district') || undefined;
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [data, setData] = useState<DiscoveryResponse>({
    items: [],
    pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    filters: {},
  });
  const [templates, setTemplates] = useState<ContentTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  // Load published templates for filters
  useEffect(() => {
    fetchTemplates('PUBLISHED')
      .then((list) => setTemplates(list || []))
      .catch((err) => console.warn('Failed to load published templates', err));
  }, []);

  // Fetch search results whenever URL parameters change
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    searchContent({
      q: q || undefined,
      templateId,
      region,
      district,
      page,
      limit: 20,
    })
      .then((res) => {
        if (!cancelled) {
          setData(res);
        }
      })
      .catch((err) => {
        console.warn('Search query error', err);
        if (!cancelled) {
          setData({
            items: [],
            pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
            filters: {},
          });
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [q, templateId, region, district, page]);

  // Helper to push updated search parameters to the URL
  const updateUrlParams = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, val]) => {
      if (val !== undefined && val !== '') {
        params.set(key, val);
      } else {
        params.delete(key);
      }
    });

    // Reset to page 1 on filter/search change unless explicitly navigating page
    if (!('page' in updates)) {
      params.delete('page');
    }

    router.push(`/discover?${params.toString()}`);
  };

  const handleSearch = (newQuery: string) => {
    updateUrlParams({ q: newQuery });
  };

  const handleTemplateChange = (tplId: string | undefined) => {
    updateUrlParams({ templateId: tplId });
  };

  const handleDistrictChange = (dist: string | undefined) => {
    updateUrlParams({ district: dist });
  };

  const handleRegionChange = (reg: string | undefined) => {
    updateUrlParams({ region: reg });
  };

  const handleResetFilters = () => {
    router.push('/discover');
  };

  const handlePageChange = (newPage: number) => {
    updateUrlParams({ page: String(newPage) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-stone-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header & Search Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-semibold">
            <Compass className="w-3.5 h-3.5 text-emerald-700" />
            <span>Generic Discovery Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
            Discover Chhattisgarh Tourism
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
            Search across waterfalls, tribal traditions, sacred temples, festive carnivals, and cultural folklore with real-time geographic indexing.
          </p>

          <div className="pt-2">
            <SearchBar initialValue={q} onSearch={handleSearch} />
          </div>
        </div>

        {/* View Mode Switcher & Filter Bar */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-stone-900 tracking-tight">
              {q ? `Search results for "${q}"` : 'All Tourism Experiences'}
            </h2>

            {/* View Mode Toggle */}
            <div className="inline-flex rounded-xl border border-stone-200 bg-white p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  viewMode === 'grid'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>List View</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  viewMode === 'map'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>Map View</span>
              </button>
            </div>
          </div>

          {/* Faceted Filters */}
          <DiscoveryFilters
            templates={templates}
            selectedTemplateId={templateId}
            selectedDistrict={district}
            selectedRegion={region}
            onTemplateChange={handleTemplateChange}
            onDistrictChange={handleDistrictChange}
            onRegionChange={handleRegionChange}
            onReset={handleResetFilters}
          />
        </div>

        {/* Results Area */}
        {viewMode === 'grid' ? (
          <div className="space-y-6">
            <SearchResults
              items={data.items}
              total={data.pagination.total}
              loading={loading}
            />

            <Pagination
              page={data.pagination.page}
              totalPages={data.pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        ) : (
          <div className="space-y-6">
            <MapResults items={data.items} height="560px" />
            <p className="text-xs text-stone-500 text-center">
              Displaying {data.items.length} experiences with geographic coordinates.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
