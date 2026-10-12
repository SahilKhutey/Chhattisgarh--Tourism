import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { SocialStoriesSection } from '@/components/social/home/SocialStoriesSection';
import { DistrictSocialStories } from '@/components/social/district/DistrictSocialStories';
import { socialApi } from '@/lib/social/api';
import {
  getTourismMapPath,
  getTourismPlannerPath,
} from '@/lib/social/navigation';

describe('Social Engine Phase 10 System Integration Tests', () => {
  describe('Navigation Helpers', () => {
    it('generates correct map and itinerary planning paths', () => {
      expect(getTourismMapPath()).toBe('/map');
      expect(getTourismMapPath('chitrakote-falls')).toBe('/map?place=chitrakote-falls');
      expect(getTourismPlannerPath()).toBe('/plan');
      expect(getTourismPlannerPath('teerathgarh-falls')).toBe('/plan?place=teerathgarh-falls');
    });
  });

  describe('Unified Social API Surface (Section 10.25)', () => {
    it('exposes all required API methods on socialApi', () => {
      expect(typeof socialApi.getFeed).toBe('function');
      expect(typeof socialApi.getContent).toBe('function');
      expect(typeof socialApi.getCreators).toBe('function');
      expect(typeof socialApi.getCreator).toBe('function');
      expect(typeof socialApi.getDistrictContent).toBe('function');
      expect(typeof socialApi.getPlaceContent).toBe('function');
    });

    it('retrieves creator by handle or ID with fallback to mock data', async () => {
      const creator = await socialApi.getCreator('bastartrails');
      expect(creator).toBeDefined();
      expect(creator.handle).toBe('bastartrails');
      expect(creator.is_verified).toBe(true);
    });
  });

  describe('SocialStoriesSection (Homepage Widget)', () => {
    it('renders the stories section with CTA and cards', async () => {
      render(<SocialStoriesSection limit={4} />);

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /Stories From Chhattisgarh/i })
        ).toBeInTheDocument();
      });

      expect(screen.getByText(/View all Stories/i)).toBeInTheDocument();
      expect(screen.getByText(/Community Stories/i)).toBeInTheDocument();
    });
  });

  describe('DistrictSocialStories (District Hub Widget)', () => {
    it('renders local perspectives for specified district', async () => {
      render(
        <DistrictSocialStories districtSlug="bastar" districtName="Bastar" limit={4} />
      );

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: /Stories from Bastar/i })
        ).toBeInTheDocument();
      });

      expect(screen.getByText(/Explore All Bastar Stories/i)).toBeInTheDocument();
      expect(screen.getByText(/Local Perspectives/i)).toBeInTheDocument();
    });
  });
});
