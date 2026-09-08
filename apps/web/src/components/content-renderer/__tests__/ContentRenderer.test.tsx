/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ContentRenderer } from '../ContentRenderer';
import { ContentEntry } from '../../template-builder/types';

describe('ContentRenderer Component', () => {
  const mockEntry: ContentEntry = {
    id: 'entry-123',
    templateId: 'tpl-1',
    template: {
      id: 'tpl-1',
      name: 'Destination',
      slug: 'destination',
    },
    data: {
      title: 'Tirathgarh Waterfalls',
      summary: 'A multi-tiered block waterfall in the Kanger Ghati National Park.',
      district: 'Bastar',
      bestSeason: 'October to February',
      entryFee: 50,
      tags: ['waterfall', 'bastar', 'kanger'],
      location: { lat: 18.914, lng: 81.864 },
    },
    status: 'PUBLISHED',
    authorId: 'author-1',
    region: 'Bastar',
    lat: 18.914,
    lng: 81.864,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('renders title, summary, district, and entry fee correctly', () => {
    render(<ContentRenderer entry={mockEntry} />);

    expect(screen.getByText('Tirathgarh Waterfalls')).toBeInTheDocument();
    expect(screen.getByText(/A multi-tiered block waterfall/i)).toBeInTheDocument();
    expect(screen.getByText('Bastar')).toBeInTheDocument();
    expect(screen.getByText('₹50')).toBeInTheDocument();
    expect(screen.getByText('October to February')).toBeInTheDocument();
    expect(screen.getByText('#waterfall')).toBeInTheDocument();
  });

  it('displays moderator review bar when in pending review and user is moderator', () => {
    const pendingEntry: ContentEntry = {
      ...mockEntry,
      status: 'PENDING_REVIEW',
    };

    render(
      <ContentRenderer
        entry={pendingEntry}
        isModerator={true}
        onReview={jest.fn()}
      />,
    );

    expect(screen.getByText(/pending moderation review/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Approve & Publish/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reject/i })).toBeInTheDocument();
  });
});
