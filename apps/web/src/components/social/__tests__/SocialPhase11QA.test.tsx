/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import { SocialContentCard } from '../SocialContentCard';
import { SocialFeedTabs } from '../SocialFeedTabs';
import { SocialCreatorStrip } from '../SocialCreatorStrip';
import { SocialContextBadge } from '../SocialContextBadge';
import { SocialOpenSourceButton } from '../SocialOpenSourceButton';
import { SocialMediaLightbox } from '../overlays/SocialMediaLightbox';
import { MOCK_SOCIAL_CONTENT, MOCK_CREATORS } from '@/lib/social/mock-data';

describe('Phase 11 QA & End-to-End User Experience Gate (Sections 11.51 - 11.76)', () => {
  const sampleReel = MOCK_SOCIAL_CONTENT[0]; // Chitrakote Falls Reel
  const sampleVideo = MOCK_SOCIAL_CONTENT[1]; // Bastar Dussehra Video

  // ── Journey 1: Consumer Discovery to Attribution ───────────────────────────
  describe('Journey 1: Social Discovery & Attribution', () => {
    it('renders card with verified creator, regional tag, and source attribution', () => {
      render(<SocialContentCard content={sampleReel} variant="default" />);

      // Creator and regional attribution
      expect(screen.getByText(sampleReel.creator!.display_name)).toBeInTheDocument();
      expect(screen.getByText('Chitrakote Falls')).toBeInTheDocument();

      // Original source link is present and accessible
      const sourceLink = screen.getByRole('link', {
        name: /open original content on instagram/i,
      });
      expect(sourceLink).toHaveAttribute('href', sampleReel.source_url);
      expect(sourceLink).toHaveAttribute('target', '_blank');
      expect(sourceLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  // ── Journey 2: Feed Formats & Filter Navigation ────────────────────────────
  describe('Journey 2: Format Tabs & Accessibility', () => {
    it('renders accessible tab list and triggers tab switch callbacks', () => {
      const handleTabChange = jest.fn();
      render(<SocialFeedTabs activeTab="all" onTabChange={handleTabChange} />);

      const tablist = screen.getByRole('tablist', { name: /social content formats/i });
      expect(tablist).toBeInTheDocument();

      const reelsTab = screen.getByRole('tab', { name: /reels/i });
      const videosTab = screen.getByRole('tab', { name: /videos/i });

      // Active state verification
      const allTab = screen.getByRole('tab', { name: /all stories/i });
      expect(allTab).toHaveAttribute('aria-selected', 'true');
      expect(reelsTab).toHaveAttribute('aria-selected', 'false');

      // Click tab triggers callback
      fireEvent.click(reelsTab);
      expect(handleTabChange).toHaveBeenCalledWith('reel');

      fireEvent.click(videosTab);
      expect(handleTabChange).toHaveBeenCalledWith('video');
    });
  });

  // ── Journey 3: Verified Creator Discovery Strip ───────────────────────────
  describe('Journey 3: Creator Discovery Strip', () => {
    it('renders horizontal creator strip with handles and district links', () => {
      render(<SocialCreatorStrip creators={MOCK_CREATORS} />);

      expect(screen.getByRole('region', { name: /regional creators discovery/i })).toBeInTheDocument();
      expect(screen.getByText(/Verified Regional Creators/i)).toBeInTheDocument();

      // Check first creator rendered
      const firstCreator = MOCK_CREATORS[0];
      expect(screen.getByText(firstCreator.display_name)).toBeInTheDocument();
      const creatorLink = screen.getByRole('link', { name: new RegExp(firstCreator.display_name, 'i') });
      expect(creatorLink).toHaveAttribute('href', `/social/creators/${firstCreator.handle}`);
    });

    it('returns null gracefully when creator array is empty', () => {
      const { container } = render(<SocialCreatorStrip creators={[]} />);
      expect(container.firstChild).toBeNull();
    });
  });

  // ── Journey 4: Media Lightbox & Keyboard Focus ────────────────────────────
  describe('Journey 4: Media Lightbox Modal & Keyboard Navigation', () => {
    it('handles Escape key to close modal and renders destination actions', () => {
      const handleClose = jest.fn();
      render(
        <SocialMediaLightbox
          content={sampleReel}
          isOpen={true}
          onClose={handleClose}
        />
      );

      // Verify modal content
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(sampleReel.title)).toBeInTheDocument();

      // Verify close button has accessible aria label
      const closeButton = screen.getByRole('button', { name: /close media preview/i });
      expect(closeButton).toBeInTheDocument();

      // Press Escape key
      fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('does not render when isOpen is false', () => {
      const handleClose = jest.fn();
      const { container } = render(
        <SocialMediaLightbox
          content={sampleReel}
          isOpen={false}
          onClose={handleClose}
        />
      );
      expect(container.firstChild).toBeNull();
    });
  });

  // ── Journey 5: Regional Tourism Context Bridge ────────────────────────────
  describe('Journey 5: Tourism Entity Graph Context Bridge', () => {
    it('renders interactive place tag linking directly to tourism place page', () => {
      render(
        <SocialContextBadge
          placeSlug="chitrakote-falls"
          placeName="Chitrakote Falls"
          districtId="bastar"
          interactive={true}
        />
      );

      const placeLink = screen.getByRole('link');
      expect(placeLink).toHaveAttribute('href', '/social/places/chitrakote-falls');
      expect(screen.getByText('Chitrakote Falls')).toBeInTheDocument();
      expect(screen.getByText(/bastar/i)).toBeInTheDocument();
    });

    it('renders district link when placeSlug is not provided', () => {
      render(
        <SocialContextBadge
          districtId="surguja"
          interactive={true}
        />
      );

      const districtLink = screen.getByRole('link');
      expect(districtLink).toHaveAttribute('href', '/social/districts/surguja');
      expect(screen.getByText('Surguja')).toBeInTheDocument();
    });
  });

  // ── Journey 6: Original Source CTA Button ─────────────────────────────────
  describe('Journey 6: Open Original Source Security & Behavior', () => {
    it('renders secure outbound anchor pointing to YouTube', () => {
      render(
        <SocialOpenSourceButton
          sourceUrl="https://youtube.com/watch?v=sample123"
          provider="YOUTUBE"
          variant="primary"
        />
      );

      const btn = screen.getByRole('link', { name: /open original content on youtube/i });
      expect(btn).toHaveAttribute('href', 'https://youtube.com/watch?v=sample123');
      expect(btn).toHaveAttribute('target', '_blank');
      expect(btn).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('returns null if sourceUrl is unavailable', () => {
      const { container } = render(
        <SocialOpenSourceButton
          sourceUrl="SOURCE_UNAVAILABLE"
          provider="YOUTUBE"
        />
      );
      expect(container.firstChild).toBeNull();
    });
  });
});
