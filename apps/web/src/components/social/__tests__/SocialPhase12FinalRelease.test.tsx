/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import { SocialContentCard } from '../SocialContentCard';
import { SocialOpenSourceButton } from '../SocialOpenSourceButton';
import { SocialContextBadge } from '../SocialContextBadge';
import { SocialMediaLightbox } from '../overlays/SocialMediaLightbox';
import { MOCK_SOCIAL_CONTENT, MOCK_CREATORS } from '@/lib/social/mock-data';
import {
  getTourismMapPath,
  getTourismPlannerPath,
  getSocialPlacePath,
  getSocialDistrictPath,
  getTourismDestinationPath,
} from '@/lib/social/navigation';

describe('Phase 12 Final Release Verification & Golden Path UX (Sections 12.25 - 12.46)', () => {
  const sampleReel = MOCK_SOCIAL_CONTENT[0]; // Instagram Reel (Chitrakote Falls)
  const sampleVideo = MOCK_SOCIAL_CONTENT[1]; // YouTube Video (Bastar Dussehra)

  describe('1. Full Consumer Golden Path Flow (Feed -> Place -> Map -> Plan -> Source)', () => {
    it('executes complete journey from feed card to place context and trip planning', () => {
      render(<SocialContentCard content={sampleReel} variant="default" />);

      // 1. Discover in Feed
      expect(screen.getByText(sampleReel.title)).toBeInTheDocument();
      expect(screen.getByText(sampleReel.creator!.display_name)).toBeInTheDocument();

      // 2. Place Context Badge
      expect(screen.getByText('Chitrakote Falls')).toBeInTheDocument();
      const placeLinks = screen.getAllByRole('link', { name: /chitrakote falls/i });
      const hasPlaceBadgeLink = placeLinks.some(
        (l) => l.getAttribute('href') === `/social/places/${sampleReel.place_slug}`
      );
      expect(hasPlaceBadgeLink).toBe(true);

      // 3. Navigation helper URLs correctly link to tourism operating system
      expect(getSocialPlacePath(sampleReel.place_slug!)).toBe(`/social/places/${sampleReel.place_slug}`);
      expect(getSocialDistrictPath(sampleReel.district_id)).toBe(`/social/districts/${sampleReel.district_id}`);
      expect(getTourismDestinationPath(sampleReel.place_slug!)).toBe(`/destinations/${sampleReel.place_slug}`);
      expect(getTourismMapPath(sampleReel.place_slug || undefined)).toBe(`/map?place=${sampleReel.place_slug}`);
      expect(getTourismPlannerPath(sampleReel.place_slug || undefined)).toBe(`/plan?place=${sampleReel.place_slug}`);

      // 4. Source Attribution directly preserved
      const sourceBtn = screen.getByRole('link', {
        name: /open original content on instagram/i,
      });
      expect(sourceBtn).toHaveAttribute('href', sampleReel.source_url);
    });
  });

  describe('2. Canonical Multi-Platform Display (YouTube & Instagram)', () => {
    it('renders YouTube content card with correct badges and attributes', () => {
      render(<SocialContentCard content={sampleVideo} variant="default" />);

      expect(screen.getByText(sampleVideo.title)).toBeInTheDocument();
      const sourceBtn = screen.getByRole('link', {
        name: /open original content on youtube/i,
      });
      expect(sourceBtn).toHaveAttribute('href', sampleVideo.source_url);
      expect(sourceBtn).toHaveAttribute('target', '_blank');
      expect(sourceBtn).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('renders Instagram content card with correct badges and attributes', () => {
      render(<SocialContentCard content={sampleReel} variant="compact" />);

      expect(screen.getByText(sampleReel.title)).toBeInTheDocument();
      const sourceBtn = screen.getByRole('link', {
        name: /open original content on instagram/i,
      });
      expect(sourceBtn).toHaveAttribute('href', sampleReel.source_url);
    });
  });

  describe('3. SocialOpenSourceButton Behavioral Standards (Rule 3)', () => {
    it('enforces backend source URL ownership without client tampering', () => {
      render(
        <SocialOpenSourceButton
          sourceUrl="https://youtube.com/watch?v=cg_destinations_4k"
          provider="youtube"
          variant="secondary"
        />
      );

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', 'https://youtube.com/watch?v=cg_destinations_4k');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      expect(link).toHaveTextContent(/YouTube/i);
    });

    it('renders compact variant cleanly', () => {
      render(
        <SocialOpenSourceButton
          sourceUrl="https://instagram.com/reel/cg_bastar_dance"
          provider="instagram"
          variant="compact"
        />
      );

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', 'https://instagram.com/reel/cg_bastar_dance');
      expect(link).toHaveTextContent(/Instagram/i);
    });
  });

  describe('4. Lightbox Modal Golden Path & Experience Actions', () => {
    it('renders tourism planning action in lightbox and closes cleanly', () => {
      const handleClose = jest.fn();
      render(
        <SocialMediaLightbox
          content={sampleReel}
          isOpen={true}
          onClose={handleClose}
        />
      );

      // Verify dialog is open with title & creator
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(sampleReel.title)).toBeInTheDocument();
      expect(screen.getByText(sampleReel.creator!.display_name)).toBeInTheDocument();

      // Verify Plan Visit CTA in lightbox
      const planCta = screen.getByRole('link', { name: new RegExp(`Plan Visit to ${sampleReel.place_name}`, 'i') });
      expect(planCta.getAttribute('href')).toMatch(new RegExp(sampleReel.place_slug!));

      // Verify Close action
      const closeBtn = screen.getByRole('button', { name: /close media preview/i });
      fireEvent.click(closeBtn);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('5. SocialContextBadge Editorial Integrity', () => {
    it('displays place and district context with proper interactive links', () => {
      render(
        <SocialContextBadge
          placeName="Teerathgarh Falls"
          placeSlug="teerathgarh-falls"
          districtId="bastar"
          interactive={true}
        />
      );

      expect(screen.getByText('Teerathgarh Falls')).toBeInTheDocument();
      expect(screen.getByText(/bastar/i)).toBeInTheDocument();

      const placeLink = screen.getByRole('link');
      expect(placeLink).toHaveAttribute('href', '/social/places/teerathgarh-falls');
    });
  });
});
