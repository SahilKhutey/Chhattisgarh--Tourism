'use client';

import React from 'react';
import { SocialContent, SocialFeedTemplate } from '@/lib/social/types';
import { SocialContentCard } from './SocialContentCard';

export interface SocialFeedGridProps {
  template: SocialFeedTemplate;
  items: SocialContent[];
  className?: string;
  onMediaClick?: (content: SocialContent) => void;
}

export function StandardSocialGrid({
  items,
  columns,
  className = '',
  onMediaClick,
}: {
  items: SocialContent[];
  columns: SocialFeedTemplate['columns'];
  className?: string;
  onMediaClick?: (content: SocialContent) => void;
}) {
  return (
    <div
      className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 ${className}`}
      data-testid="standard-social-grid"
    >
      {items.map((item, idx) => (
        <SocialContentCard
          key={item.id}
          content={item}
          variant="default"
          priority={idx < 4}
          onMediaClick={onMediaClick}
        />
      ))}
    </div>
  );
}

export function MasonrySocialGrid({
  items,
  className = '',
  onMediaClick,
}: {
  items: SocialContent[];
  className?: string;
  onMediaClick?: (content: SocialContent) => void;
}) {
  return (
    <div
      className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 items-start ${className}`}
      data-testid="masonry-social-grid"
    >
      {items.map((item, idx) => {
        const isHighlight = idx % 5 === 0;
        return (
          <div
            key={item.id}
            className={isHighlight ? 'md:row-span-2' : ''}
          >
            <SocialContentCard
              content={item}
              variant={isHighlight ? 'featured' : 'default'}
              priority={idx < 3}
              showDescription={isHighlight}
              onMediaClick={onMediaClick}
            />
          </div>
        );
      })}
    </div>
  );
}

export function FeaturedSocialGrid({
  items,
  className = '',
  onMediaClick,
}: {
  items: SocialContent[];
  className?: string;
  onMediaClick?: (content: SocialContent) => void;
}) {
  if (items.length === 0) return null;
  const [featured, ...rest] = items;

  return (
    <div
      className={`flex flex-col gap-4 sm:gap-6 ${className}`}
      data-testid="featured-social-grid"
    >
      {/* Top Hero Card */}
      {featured && (
        <div className="w-full">
          <SocialContentCard
            content={featured}
            variant="featured"
            priority={true}
            showDescription={true}
            onMediaClick={onMediaClick}
          />
        </div>
      )}

      {/* Trailing Grid */}
      {rest.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
          {rest.map((item) => (
            <SocialContentCard
              key={item.id}
              content={item}
              variant="default"
              onMediaClick={onMediaClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function RegionalSocialGrid({
  items,
  className = '',
  onMediaClick,
}: {
  items: SocialContent[];
  className?: string;
  onMediaClick?: (content: SocialContent) => void;
}) {
  if (items.length === 0) return null;
  const heroItem = items[0];
  const sideItems = items.slice(1, 3);
  const trailingItems = items.slice(3);

  return (
    <div
      className={`flex flex-col gap-4 sm:gap-6 ${className}`}
      data-testid="regional-social-grid"
    >
      {/* Regional Hero + Side Stack */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {heroItem && (
          <div className="md:col-span-7 lg:col-span-8">
            <SocialContentCard
              content={heroItem}
              variant="featured"
              priority={true}
              showDescription={true}
              onMediaClick={onMediaClick}
            />
          </div>
        )}
        {sideItems.length > 0 && (
          <div className="md:col-span-5 lg:col-span-4 flex flex-col gap-4">
            {sideItems.map((item) => (
              <div key={item.id} className="flex-1">
                <SocialContentCard
                  content={item}
                  variant="default"
                  showDescription={false}
                  onMediaClick={onMediaClick}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Trailing Regional Stories */}
      {trailingItems.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {trailingItems.map((item) => (
            <SocialContentCard
              key={item.id}
              content={item}
              variant="default"
              onMediaClick={onMediaClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CompactSocialGrid({
  items,
  className = '',
  onMediaClick,
}: {
  items: SocialContent[];
  className?: string;
  onMediaClick?: (content: SocialContent) => void;
}) {
  return (
    <div
      className={`grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 ${className}`}
      data-testid="compact-social-grid"
    >
      {items.map((item) => (
        <SocialContentCard
          key={item.id}
          content={item}
          variant="compact"
          onMediaClick={onMediaClick}
        />
      ))}
    </div>
  );
}

export function SocialFeedGrid({
  template,
  items,
  className = '',
  onMediaClick,
}: SocialFeedGridProps) {
  switch (template.layout) {
    case 'masonry':
      return <MasonrySocialGrid items={items} className={className} onMediaClick={onMediaClick} />;
    case 'featured-grid':
      return <FeaturedSocialGrid items={items} className={className} onMediaClick={onMediaClick} />;
    case 'regional-showcase':
      return <RegionalSocialGrid items={items} className={className} onMediaClick={onMediaClick} />;
    case 'compact-grid':
      return <CompactSocialGrid items={items} className={className} onMediaClick={onMediaClick} />;
    case 'standard-grid':
    default:
      return (
        <StandardSocialGrid
          items={items}
          columns={template.columns}
          className={className}
          onMediaClick={onMediaClick}
        />
      );
  }
}
