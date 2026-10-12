/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SocialFeedGrid } from '../SocialFeedGrid';
import { SocialFeed } from '../SocialFeed';
import {
  STANDARD_SOCIAL_FEED,
  MASONRY_SOCIAL_FEED,
  FEATURED_GRID_FEED,
  REGIONAL_SHOWCASE_FEED,
  COMPACT_GRID_FEED,
} from '@/lib/social/templates';
import { MOCK_SOCIAL_CONTENT } from '@/lib/social/mock-data';

describe('SocialFeedGrid & SocialFeed Orchestrator', () => {
  it('renders standard-grid layout', () => {
    render(<SocialFeedGrid template={STANDARD_SOCIAL_FEED} items={MOCK_SOCIAL_CONTENT} />);
    expect(screen.getByTestId('standard-social-grid')).toBeInTheDocument();
  });

  it('renders masonry layout', () => {
    render(<SocialFeedGrid template={MASONRY_SOCIAL_FEED} items={MOCK_SOCIAL_CONTENT} />);
    expect(screen.getByTestId('masonry-social-grid')).toBeInTheDocument();
  });

  it('renders featured-grid layout', () => {
    render(<SocialFeedGrid template={FEATURED_GRID_FEED} items={MOCK_SOCIAL_CONTENT} />);
    expect(screen.getByTestId('featured-social-grid')).toBeInTheDocument();
  });

  it('renders regional-showcase layout', () => {
    render(<SocialFeedGrid template={REGIONAL_SHOWCASE_FEED} items={MOCK_SOCIAL_CONTENT} />);
    expect(screen.getByTestId('regional-social-grid')).toBeInTheDocument();
  });

  it('renders compact-grid layout', () => {
    render(<SocialFeedGrid template={COMPACT_GRID_FEED} items={MOCK_SOCIAL_CONTENT} />);
    expect(screen.getByTestId('compact-social-grid')).toBeInTheDocument();
  });

  it('renders loading skeleton when items are empty and loading=true', () => {
    render(
      <SocialFeed
        template={STANDARD_SOCIAL_FEED}
        items={[]}
        loading={true}
      />
    );
    expect(screen.getByLabelText('Loading social content')).toBeInTheDocument();
  });

  it('renders empty state when items are empty and loading=false', () => {
    render(
      <SocialFeed
        template={STANDARD_SOCIAL_FEED}
        items={[]}
        loading={false}
      />
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/no stories here yet/i)).toBeInTheDocument();
  });

  it('renders error state when error is provided and items are empty', () => {
    render(
      <SocialFeed
        template={STANDARD_SOCIAL_FEED}
        items={[]}
        error={new Error('Network error')}
      />
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/we couldn't load these stories/i)).toBeInTheDocument();
  });
});
