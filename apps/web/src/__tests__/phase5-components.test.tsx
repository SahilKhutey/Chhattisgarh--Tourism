/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CreatorCard, CreatorCardData } from '@/features/community/components/CreatorCard';
import { ContentGallery, CreatorContentItem } from '@/features/community/components/ContentGallery';
import { BookingModal, BookingProduct } from '@/features/commerce/components/BookingModal';
import { SosTriggerModal } from '@/features/safety/components/SosTriggerModal';

describe('Phase 5 Web Components Suite', () => {
  describe('CreatorCard', () => {
    const verifiedCreator: CreatorCardData = {
      id: 'cr-1',
      name: 'Ramesh Patel',
      district: 'Bastar',
      bio: 'Exploring tribal culture and hidden waterfalls.',
      creatorStatus: 'VERIFIED',
      verified: true,
      followersCount: 1250,
      viewsCount: 34000,
      categories: ['Tribal Art', 'Trekking'],
    };

    const unverifiedCreator: CreatorCardData = {
      id: 'cr-2',
      name: 'Priya Sharma',
      district: 'Surguja',
      bio: 'Travel enthusiast.',
      creatorStatus: 'PENDING',
      verified: false,
      followersCount: 50,
      viewsCount: 120,
    };

    it('renders verified creator with verified badge and metrics', () => {
      render(<CreatorCard creator={verifiedCreator} />);

      expect(screen.getByText('Ramesh Patel')).toBeInTheDocument();
      expect(screen.getByText(/Bastar District/i)).toBeInTheDocument();
      expect(screen.getByText('Verified')).toBeInTheDocument();
      expect(screen.getByText('1,250')).toBeInTheDocument();
      expect(screen.getByText('34,000')).toBeInTheDocument();
    });

    it('renders unverified creator with pending verification tag', () => {
      render(<CreatorCard creator={unverifiedCreator} />);

      expect(screen.getByText('Priya Sharma')).toBeInTheDocument();
      expect(screen.getByText('Pending Verification')).toBeInTheDocument();
    });

    it('calls onFollow callback when follow button clicked', () => {
      const handleFollow = jest.fn();
      render(<CreatorCard creator={verifiedCreator} onFollow={handleFollow} />);

      const followBtn = screen.getByRole('button', { name: /Follow/i });
      fireEvent.click(followBtn);

      expect(handleFollow).toHaveBeenCalledWith('cr-1');
    });
  });

  describe('ContentGallery', () => {
    const mockItems: CreatorContentItem[] = [
      {
        id: 'c-1',
        type: 'STORY',
        title: 'Hidden Waterfalls of Kanger Valley',
        description: 'Trek inside deep rainforest gorge.',
        moderationStatus: 'APPROVED',
        creatorName: 'Ramesh',
        location: 'Kanger Valley',
      },
      {
        id: 'c-2',
        type: 'VIDEO',
        title: 'Bastar Bell Metal Crafting',
        moderationStatus: 'PENDING',
        creatorName: 'Sunita',
        location: 'Kondagaon',
      },
    ];

    it('renders gallery items with moderation status tags', () => {
      render(<ContentGallery items={mockItems} />);

      expect(screen.getByText('Hidden Waterfalls of Kanger Valley')).toBeInTheDocument();
      expect(screen.getByText('Bastar Bell Metal Crafting')).toBeInTheDocument();
      expect(screen.getByText('Verified')).toBeInTheDocument();
      expect(screen.getByText('In Review')).toBeInTheDocument();
    });

    it('filters items when filter buttons are clicked', () => {
      render(<ContentGallery items={mockItems} />);

      const verifiedFilterBtn = screen.getByRole('button', { name: /Verified Published/i });
      fireEvent.click(verifiedFilterBtn);

      expect(screen.getByText('Hidden Waterfalls of Kanger Valley')).toBeInTheDocument();
      expect(screen.queryByText('Bastar Bell Metal Crafting')).not.toBeInTheDocument();
    });
  });

  describe('BookingModal', () => {
    const mockProduct: BookingProduct = {
      id: '00000000-0000-4000-8000-000000000001',
      name: 'Kanger Valley Safari',
      partnerName: 'Bastar Eco Guides',
      unitPricePaise: 150000, // ₹1,500
      maxGuests: 6,
      availableSlots: [
        {
          id: '00000000-0000-4000-8000-000000000002',
          startAt: new Date(Date.now() + 86400000).toISOString(),
          capacity: 4,
          reserved: 1,
        },
      ],
    };

    it('renders pricing breakdown correctly in rupees', () => {
      render(
        <BookingModal
          product={mockProduct}
          isOpen={true}
          onClose={jest.fn()}
          onConfirmBooking={jest.fn()}
        />,
      );

      // Unit price ₹1500 × 1 = ₹1500, Platform fee 5% = ₹75, Total = ₹1575
      expect(screen.getByText(/₹1500 × 1 guest/i)).toBeInTheDocument();
      expect(screen.getByText('₹75')).toBeInTheDocument();
      expect(screen.getByText('₹1575')).toBeInTheDocument();
    });

    it('updates total price when guest count increments', () => {
      render(
        <BookingModal
          product={mockProduct}
          isOpen={true}
          onClose={jest.fn()}
          onConfirmBooking={jest.fn()}
        />,
      );

      const plusBtn = screen.getByRole('button', { name: '+' });
      fireEvent.click(plusBtn);

      // 2 guests: ₹3000, Platform fee 5% = ₹150, Total = ₹3150
      expect(screen.getByText(/₹1500 × 2 guests/i)).toBeInTheDocument();
      expect(screen.getByText('₹150')).toBeInTheDocument();
      expect(screen.getByText('₹3150')).toBeInTheDocument();
    });
  });

  describe('SosTriggerModal', () => {
    it('renders emergency hotline numbers and hold-to-activate button', () => {
      render(
        <SosTriggerModal
          isOpen={true}
          onClose={jest.fn()}
          onTriggerSos={jest.fn().mockResolvedValue({ id: 'inc-1', status: 'TRIGGERED' })}
        />,
      );

      expect(screen.getByText('Emergency SOS')).toBeInTheDocument();
      expect(screen.getByText(/112 \(Police\)/i)).toBeInTheDocument();
      expect(screen.getByText(/108 \(Ambulance\)/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Hold SOS/i })).toBeInTheDocument();
    });
  });
});
