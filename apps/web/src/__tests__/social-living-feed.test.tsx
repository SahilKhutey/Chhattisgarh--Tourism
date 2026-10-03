/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  ReelPlayer,
  StoryBar,
  StoryViewerModal,
  CulturalNarrativeCard,
  CreateContentModal,
  DestinationSocialShowcase,
  SocialContentItem,
  StoryItem,
} from '@/features/social';

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || ''} />;
  },
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('Social Living Feed UI & Discovery Suite', () => {
  const mockReelItem: SocialContentItem = {
    id: 'reel-chitrakote-1',
    creator_id: 'c-1',
    creator: {
      id: 'c-1',
      handle: 'bastar_local',
      display_name: 'Somnath Mandavi',
      status: 'VERIFIED',
      verification_badge: true,
      followers_count: 5200,
      following_count: 40,
      posts_count: 24,
    },
    content_type: 'REEL',
    title: 'Monsoon Thunder at Chitrakote Horseshoe Falls',
    caption: 'The Indravati river at its absolute peak flow. Stand at the western forest point for rainbow spray.',
    slug: 'monsoon-thunder-chitrakote',
    place_slug: 'chitrakote-falls',
    place_name: 'Chitrakote Falls',
    district_id: 'bastar',
    district_name: 'Bastar',
    festival_name: 'Bastar Dussehra',
    cultural_tags: ['Waterfalls', 'Monsoon', 'Bastar'],
    cultural_sensitivity_level: 'SACRED_TRIBAL_RITUAL',
    has_sacred_consent: true,
    community_attribution: 'Maria Tribal Clan Council',
    status: 'PUBLISHED',
    likes_count: 350,
    comments_count: 24,
    shares_count: 85,
    saves_count: 120,
    trip_adds_count: 95,
    is_evergreen: true,
    created_at: new Date().toISOString(),
    media_items: [
      {
        media_type: 'VIDEO',
        media_url: 'https://example.com/chitrakote.mp4',
        thumbnail_url: 'https://example.com/thumb.jpg',
        aspect_ratio: '9:16',
      },
    ],
  };

  const mockStoryList: StoryItem[] = [
    {
      id: 'st-1',
      title: 'Sirpur Brick Monastery Sunrise',
      media_url: 'https://example.com/sirpur.jpg',
      media_type: 'IMAGE',
      district_id: 'mahasamund',
      place_slug: 'sirpur-heritage-site',
      created_at: new Date().toISOString(),
      creator: {
        id: 'c-2',
        handle: 'heritage_dr',
        display_name: 'Dr. Ananya',
        status: 'VERIFIED',
        verification_badge: true,
        followers_count: 3400,
        following_count: 80,
        posts_count: 45,
      },
    },
  ];

  describe('ReelPlayer', () => {
    it('renders reel content with creator, district, and sacred ritual badge', () => {
      render(<ReelPlayer item={mockReelItem} isActive={true} />);

      expect(screen.getByText('Monsoon Thunder at Chitrakote Horseshoe Falls')).toBeInTheDocument();
      expect(screen.getByText('Somnath Mandavi')).toBeInTheDocument();
      expect(screen.getByText('Bastar')).toBeInTheDocument();
      expect(screen.getByText('Bastar Dussehra')).toBeInTheDocument();
      expect(screen.getByText('Sacred Ritual')).toBeInTheDocument();
    });

    it('handles Like toggle and increments counter', async () => {
      render(<ReelPlayer item={mockReelItem} />);

      const likeBtn = screen.getByTestId('like-btn');
      expect(screen.getByText('350')).toBeInTheDocument();

      fireEvent.click(likeBtn);
      expect(screen.getByText('351')).toBeInTheDocument();
    });

    it('handles Add to Trip planner interaction', async () => {
      const handleTripAdd = jest.fn();
      render(<ReelPlayer item={mockReelItem} onTripAddSuccess={handleTripAdd} />);

      const tripAddBtn = screen.getByTestId('add-to-trip-btn');
      expect(screen.getByText(/Add to Trip Planner/i)).toBeInTheDocument();

      fireEvent.click(tripAddBtn);

      expect(screen.getByText(/✓ Added to Itinerary/i)).toBeInTheDocument();
      expect(handleTripAdd).toHaveBeenCalledWith(mockReelItem);
    });
  });

  describe('StoryBar & StoryViewerModal', () => {
    it('renders story bubbles and opens StoryViewerModal on click', () => {
      render(<StoryBar stories={mockStoryList} />);

      expect(screen.getByTestId('story-bar')).toBeInTheDocument();
      const storyBubble = screen.getByText('Dr.');
      expect(storyBubble).toBeInTheDocument();

      fireEvent.click(storyBubble);

      expect(screen.getByTestId('story-viewer-modal')).toBeInTheDocument();
      expect(screen.getByText('Sirpur Brick Monastery Sunrise')).toBeInTheDocument();
      expect(screen.getByText('Dr. Ananya')).toBeInTheDocument();
    });

    it('allows adding to trip directly from story viewer', () => {
      render(
        <StoryViewerModal
          stories={mockStoryList}
          isOpen={true}
          onClose={jest.fn()}
        />
      );

      const addBtn = screen.getByTestId('story-add-to-trip-btn');
      expect(screen.getByText('Add to Trip')).toBeInTheDocument();

      fireEvent.click(addBtn);
      expect(screen.getByText('Added ✓')).toBeInTheDocument();
    });
  });

  describe('CulturalNarrativeCard', () => {
    it('renders sacred tribal ceremony attribution and expands narrative', () => {
      render(<CulturalNarrativeCard item={mockReelItem} />);

      expect(
        screen.getByText(/Sacred Tribal Ceremony Archive/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Attribution: Maria Tribal Clan Council/i)
      ).toBeInTheDocument();

      const tripBtn = screen.getByTestId('cultural-add-to-trip-btn');
      fireEvent.click(tripBtn);
      expect(screen.getByText(/Added to Trip ✓/i)).toBeInTheDocument();
    });
  });

  describe('CreateContentModal Cultural Gate', () => {
    it('mandates sacred consent and attribution when sacred ritual is selected', () => {
      render(<CreateContentModal isOpen={true} onClose={jest.fn()} />);

      expect(
        screen.getByText('Create Tourism Story / Reel')
      ).toBeInTheDocument();

      const sensitivitySelect = screen.getByDisplayValue(
        /Public Tourist Experience/i
      );
      fireEvent.change(sensitivitySelect, {
        target: { value: 'SACRED_TRIBAL_RITUAL' },
      });

      expect(
        screen.getByText(/Tribal Heritage Protection Gate/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Community \/ Clan Attribution \*/i)
      ).toBeInTheDocument();
    });
  });

  describe('DestinationSocialShowcase', () => {
    it('renders showcase header for destination', async () => {
      render(
        <DestinationSocialShowcase
          placeSlug="chitrakote-falls"
          placeName="Chitrakote Falls"
        />
      );

      await waitFor(() => {
        expect(
          screen.getByText('Stories & Reels from Chitrakote Falls')
        ).toBeInTheDocument();
      });
    });
  });
});
