/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  SocialPlatformBadge,
  SocialContentTypeBadge,
  SocialContextBadge,
  SocialOpenSourceButton,
  SocialEmptyState,
  SocialErrorState,
} from '../index';

describe('Social Component Badges & Actions', () => {
  it('renders Instagram platform badge', () => {
    render(<SocialPlatformBadge platform="INSTAGRAM" />);
    expect(screen.getByText('Instagram')).toBeInTheDocument();
    expect(screen.getByLabelText('Instagram Platform Content')).toBeInTheDocument();
  });

  it('renders YouTube platform badge', () => {
    render(<SocialPlatformBadge platform="YOUTUBE" />);
    expect(screen.getByText('YouTube')).toBeInTheDocument();
    expect(screen.getByLabelText('YouTube Platform Content')).toBeInTheDocument();
  });

  it('renders Content Type Badges (Reel, Short, Video, Post, Folklore)', () => {
    const { rerender } = render(<SocialContentTypeBadge contentType="REEL" />);
    expect(screen.getByText('Reel')).toBeInTheDocument();

    rerender(<SocialContentTypeBadge contentType="SHORT" />);
    expect(screen.getByText('Short')).toBeInTheDocument();

    rerender(<SocialContentTypeBadge contentType="VIDEO" />);
    expect(screen.getByText('Video')).toBeInTheDocument();

    rerender(<SocialContentTypeBadge contentType="POST" />);
    expect(screen.getByText('Post')).toBeInTheDocument();

    rerender(<SocialContentTypeBadge contentType="CULTURAL_STORY" />);
    expect(screen.getByText('Folklore')).toBeInTheDocument();
  });

  it('renders SocialContextBadge with district and place', () => {
    render(
      <SocialContextBadge
        districtId="bastar"
        placeSlug="chitrakote-falls"
        placeName="Chitrakote Falls"
      />
    );
    expect(screen.getByText('Chitrakote Falls')).toBeInTheDocument();
    expect(screen.getByText('• bastar')).toBeInTheDocument();
  });

  it('renders SocialOpenSourceButton with safe external attributes', () => {
    render(
      <SocialOpenSourceButton
        sourceUrl="https://www.instagram.com/reel/C8qLd5sM_99/"
        provider="INSTAGRAM"
        actionLabel="View on Instagram"
      />
    );

    const link = screen.getByRole('link', { name: /open original content on instagram/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://www.instagram.com/reel/C8qLd5sM_99/');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(screen.getByText('View on Instagram')).toBeInTheDocument();
  });

  it('renders SocialEmptyState with destination CTA and no engineering errors', () => {
    render(<SocialEmptyState />);
    expect(screen.getByText(/no stories here yet/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /explore destinations/i })).toHaveAttribute(
      'href',
      '/destinations'
    );
  });

  it('renders SocialErrorState politely without exposing technical provider details', () => {
    const retryFn = jest.fn();
    render(<SocialErrorState onRetry={retryFn} />);
    expect(screen.getByText(/we couldn't load these stories/i)).toBeInTheDocument();
    expect(screen.queryByText(/graph api|oauth|429/i)).not.toBeInTheDocument();
  });
});
