'use client';

import React from 'react';
import { SocialContent, SocialFeedTemplate } from '@/lib/social/types';
import { SocialFeedGrid } from './SocialFeedGrid';
import { SocialFeedPagination } from './SocialFeedPagination';
import { SocialFeedSkeleton } from './SocialFeedSkeleton';
import { SocialEmptyState } from './SocialEmptyState';
import { SocialErrorState } from './SocialErrorState';

export interface SocialFeedProps {
  template: SocialFeedTemplate;
  items: SocialContent[];
  loading?: boolean;
  error?: Error | null;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onRetry?: () => void;
  onResetFilters?: () => void;
  className?: string;
}

export function SocialFeed({
  template,
  items,
  loading = false,
  error = null,
  hasMore = false,
  onLoadMore,
  onRetry,
  onResetFilters,
  className = '',
}: SocialFeedProps) {
  if (loading && (!items || items.length === 0)) {
    return <SocialFeedSkeleton className={className} />;
  }

  if (error && (!items || items.length === 0)) {
    return <SocialErrorState onRetry={onRetry} className={className} />;
  }

  if (!items || items.length === 0) {
    return <SocialEmptyState onResetFilters={onResetFilters} className={className} />;
  }

  return (
    <div className={`flex flex-col gap-6 ${className}`}>
      <SocialFeedGrid template={template} items={items} />

      <SocialFeedPagination
        onLoadMore={onLoadMore}
        loading={loading}
        hasMore={hasMore}
      />
    </div>
  );
}
