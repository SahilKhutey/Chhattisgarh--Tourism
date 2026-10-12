'use client';

import React, { Suspense, useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
  SocialContent,
  SocialCreator,
} from '@/lib/social/types';
import { getSocialFeed, getPublicCreators } from '@/lib/social/api';
import { getSocialTemplate } from '@/lib/social/templates';
import {
  SocialFeedHeader,
  SocialFeedTabs,
  SocialFeedTab,
  SocialFeedFilters,
  FilterState,
  SocialFeed,
  SocialCreatorCard,
  SocialFeedSkeleton,
} from '@/components/social';

function SocialFeedContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL state synchronization
  const initialPlatform = searchParams.get('platform') || undefined;
  const initialType = searchParams.get('type') || undefined;
  const initialDistrict = searchParams.get('district') || undefined;
  const initialTab = (searchParams.get('tab') as SocialFeedTab) || 'all';

  const [activeTab, setActiveTab] = useState<SocialFeedTab>(initialTab);
  const [filters, setFilters] = useState<FilterState>({
    platform: initialPlatform,
    contentType: initialType,
    district: initialDistrict,
  });

  const [items, setItems] = useState<SocialContent[]>([]);
  const [creators, setCreators] = useState<SocialCreator[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Sync state changes back to URL
  const updateUrl = useCallback(
    (newTab: SocialFeedTab, newFilters: FilterState) => {
      const params = new URLSearchParams();
      if (newTab !== 'all') params.set('tab', newTab);
      if (newFilters.platform) params.set('platform', newFilters.platform.toLowerCase());
      if (newFilters.contentType) params.set('type', newFilters.contentType.toLowerCase());
      if (newFilters.district) params.set('district', newFilters.district.toLowerCase());

      const qs = params.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
    },
    [router, pathname]
  );

  const loadFeed = useCallback(
    async (isLoadMore = false) => {
      try {
        if (isLoadMore) {
          setLoadingMore(true);
        } else {
          setLoading(true);
          setError(null);
        }

        // Determine effective content type from tab or filters
        let effectiveType = filters.contentType;
        if (activeTab === 'reel') effectiveType = 'REEL';
        if (activeTab === 'video') effectiveType = 'VIDEO';
        if (activeTab === 'post') effectiveType = 'POST';

        const res = await getSocialFeed({
          platform: filters.platform,
          contentType: effectiveType,
          districtId: filters.district,
          offset: isLoadMore ? items.length : 0,
          limit: 12,
        });

        if (isLoadMore) {
          setItems((prev) => [...prev, ...res.items]);
        } else {
          setItems(res.items);
        }
        setNextCursor(res.next_cursor);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load feed'));
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [filters, activeTab, items.length]
  );

  useEffect(() => {
    if (activeTab === 'creators') {
      setLoading(true);
      getPublicCreators(filters.district, 24)
        .then(setCreators)
        .finally(() => setLoading(false));
    } else {
      loadFeed(false);
    }
  }, [filters, activeTab]);

  const handleTabChange = (tab: SocialFeedTab) => {
    setActiveTab(tab);
    updateUrl(tab, filters);
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    updateUrl(activeTab, newFilters);
  };

  const template = getSocialTemplate('standard-grid');

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8">
      {/* Feed Header */}
      <SocialFeedHeader
        title="Regional Social Stream"
        subtitle="Explore unfiltered perspectives, stories, reels, and photos created across Chhattisgarh."
        badge="Live Creator Stream"
        creatorLink={false}
      />

      {/* Tabs Row */}
      <div className="flex flex-col gap-4">
        <SocialFeedTabs activeTab={activeTab} onTabChange={handleTabChange} />

        {/* Filters Toolbar */}
        {activeTab !== 'creators' && (
          <SocialFeedFilters
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        )}
      </div>

      {/* Content Rendering */}
      {activeTab === 'creators' ? (
        <div>
          {loading ? (
            <SocialFeedSkeleton count={8} />
          ) : creators.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              No creators found for this district filter.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {creators.map((c) => (
                <SocialCreatorCard key={c.id || c.handle} creator={c} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <SocialFeed
          template={template}
          items={items}
          loading={loading || loadingMore}
          error={error}
          hasMore={Boolean(nextCursor)}
          onLoadMore={() => loadFeed(true)}
          onRetry={() => loadFeed(false)}
          onResetFilters={() => handleFilterChange({})}
        />
      )}
    </div>
  );
}

export default function SocialFeedPage() {
  return (
    <main className="min-h-screen bg-sand-beige/40 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<SocialFeedSkeleton count={12} />}>
        <SocialFeedContent />
      </Suspense>
    </main>
  );
}
