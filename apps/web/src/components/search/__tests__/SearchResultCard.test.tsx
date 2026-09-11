import React from 'react';
import { render, screen } from '@testing-library/react';
import { SearchResultCard } from '../SearchResultCard';
import type { SearchResult } from '@/lib/api/search';

describe('SearchResultCard', () => {
  const sampleResult: SearchResult = {
    id: 'res-1',
    slug: 'chitrakote-waterfall',
    title: 'Chitrakote Waterfall',
    description: 'The widest waterfall in India located in Bastar.',
    content_type: 'nature',
    district: 'Bastar',
    categories: ['nature', 'waterfalls'],
    tags: ['waterfall', 'scenic'],
    distance_km: 15.4,
    score: 0.95,
  };

  it('renders title, description, district, categories, and distance badge', () => {
    render(<SearchResultCard result={sampleResult} locale="en" />);

    expect(screen.getByText('Chitrakote Waterfall')).toBeInTheDocument();
    expect(
      screen.getByText('The widest waterfall in India located in Bastar.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Bastar')).toBeInTheDocument();
    expect(screen.getAllByText('nature').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('15.4 km')).toBeInTheDocument();

    const link = screen.getByRole('link', { name: 'Chitrakote Waterfall' });
    expect(link).toHaveAttribute('href', '/en/destinations/chitrakote-waterfall');
  });

  it('handles result without description and distance', () => {
    const minimalResult: SearchResult = {
      ...sampleResult,
      description: null,
      distance_km: null,
      district: null,
    };
    render(<SearchResultCard result={minimalResult} locale="hi" />);

    expect(screen.getByText('Chitrakote Waterfall')).toBeInTheDocument();
    expect(screen.queryByText('km')).not.toBeInTheDocument();
  });
});
