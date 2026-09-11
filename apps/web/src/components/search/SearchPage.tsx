'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
  searchContent,
  fetchDiscoveryLanding,
  type SearchResponse,
  type DiscoveryLandingResponse,
} from '@/lib/api/search';
import { SearchInput } from './SearchInput';
import { SearchFilters } from './SearchFilters';
import { SearchFacets } from './SearchFacets';
import { SearchResults } from './SearchResults';
import { SearchEmptyState } from './SearchEmptyState';
import { SearchLoading } from './SearchLoading';
import { DiscoveryLanding } from './DiscoveryLanding';

interface SearchPageProps {
  locale: string;
  query?: string;
  district?: string;
  category?: string;
  contentType?: string;
  page?: number;
}

export function SearchPage({
  locale,
  query: propQuery = '',
  district: propDistrict,
  category: propCategory,
  contentType: propContentType,
  page: propPage = 1,
}: SearchPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(propQuery);
  const [district, setDistrict] = useState<string | undefined>(propDistrict);
  const [category, setCategory] = useState<string | undefined>(propCategory);
  const [contentType, setContentType] = useState<string | undefined>(propContentType);
  const [page, setPage] = useState<number>(propPage);

  const [searchData, setSearchData] = useState<SearchResponse | null>(null);
  const [discoveryData, setDiscoveryData] = useState<DiscoveryLandingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sync state from searchParams
  useEffect(() => {
    const qParam = searchParams.get('q');
    const dParam = searchParams.get('district');
    const cParam = searchParams.get('category');
    const tParam = searchParams.get('contentType');
    const pParam = searchParams.get('page');

    setQuery(qParam !== null ? qParam : propQuery);
    setDistrict(dParam !== null ? (dParam || undefined) : propDistrict);
    setCategory(cParam !== null ? (cParam || undefined) : propCategory);
    setContentType(tParam !== null ? (tParam || undefined) : propContentType);
    setPage(pParam !== null ? Number(pParam || '1') : propPage);
  }, [searchParams, propQuery, propDistrict, propCategory, propContentType, propPage]);

  // Update URL helper (canonical state)
  const updateUrl = useCallback(
    (params: {
      q?: string;
      district?: string;
      category?: string;
      contentType?: string;
      page?: number;
    }) => {
      const sp = new URLSearchParams();
      if (params.q?.trim()) sp.set('q', params.q.trim());
      if (params.district) sp.set('district', params.district);
      if (params.category) sp.set('category', params.category);
      if (params.contentType) sp.set('contentType', params.contentType);
      if (params.page && params.page > 1) sp.set('page', String(params.page));

      const qs = sp.toString();
      router.push(`${pathname}${qs ? `?${qs}` : ''}`);
    },
    [router, pathname],
  );

  // Fetch search or discovery data
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    setError(null);

    const isDiscoveryMode = !query && !district && !category && !contentType;

    if (isDiscoveryMode) {
      fetchDiscoveryLanding(locale)
        .then((data) => {
          if (!isCancelled) {
            setDiscoveryData(data);
            setSearchData(null);
          }
        })
        .catch((err) => {
          if (!isCancelled) setError(err.message);
        })
        .finally(() => {
          if (!isCancelled) setLoading(false);
        });
    } else {
      const params = new URLSearchParams();
      if (query.trim()) params.set('q', query.trim());
      if (district) params.set('district', district);
      if (category) params.set('category', category);
      if (contentType) params.set('content_type', contentType);
      params.set('locale', locale);
      params.set('page', String(page));
      params.set('page_size', '18');

      searchContent(params)
        .then((data) => {
          if (!isCancelled) {
            setSearchData(data);
            setDiscoveryData(null);
          }
        })
        .catch((err) => {
          if (!isCancelled) setError(err.message);
        })
        .finally(() => {
          if (!isCancelled) setLoading(false);
        });
    }

    return () => {
      isCancelled = true;
    };
  }, [query, district, category, contentType, page, locale]);

  const handleSearch = (newQuery: string) => {
    updateUrl({
      q: newQuery,
      district,
      category,
      contentType,
      page: 1,
    });
  };

  const handleFilterChange = (filters: {
    district?: string;
    category?: string;
    contentType?: string;
  }) => {
    updateUrl({
      q: query,
      ...filters,
      page: 1,
    });
  };

  const handlePageChange = (newPage: number) => {
    updateUrl({
      q: query,
      district,
      category,
      contentType,
      page: newPage,
    });
  };

  const isDiscoveryMode = !query && !district && !category && !contentType;

  return (
    <div className="min-h-screen bg-slate-50/40 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Hero */}
        <header className="text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Explore Chhattisgarh
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Find ancient temples, pristine waterfalls, tribal art, and wildlife sanctuaries
            across 33 districts.
          </p>

          <div className="pt-2">
            <SearchInput
              initialValue={query}
              locale={locale}
              onSearch={handleSearch}
            />
          </div>
        </header>

        {/* Filters Bar (when search or active filters exist) */}
        {!isDiscoveryMode && searchData && (
          <SearchFilters
            district={district}
            category={category}
            contentType={contentType}
            districts={searchData.districts}
            categories={searchData.categories}
            contentTypes={searchData.content_types}
            onFilterChange={handleFilterChange}
          />
        )}

        {/* Main Content Area */}
        <main>
          {loading ? (
            <SearchLoading />
          ) : error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-800 my-6">
              <p className="font-semibold">Search failed to load</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          ) : isDiscoveryMode && discoveryData ? (
            <DiscoveryLanding
              locale={locale}
              featuredDestinations={discoveryData.featured_destinations}
              popularCategories={discoveryData.popular_categories}
              popularDistricts={discoveryData.popular_districts}
              onSelectCategory={(cat) => handleFilterChange({ category: cat })}
              onSelectDistrict={(dist) => handleFilterChange({ district: dist })}
            />
          ) : searchData && searchData.results.length === 0 ? (
            <SearchEmptyState
              query={query}
              onExploreDistrict={(dist) => handleFilterChange({ district: dist })}
              onExploreCategory={(cat) => handleFilterChange({ category: cat })}
            />
          ) : searchData ? (
            <SearchResults
              results={searchData.results}
              total={searchData.total}
              currentPage={searchData.page}
              pageSize={searchData.page_size}
              locale={locale}
              query={query}
              onPageChange={handlePageChange}
            />
          ) : null}
        </main>
      </div>
    </div>
  );
}
