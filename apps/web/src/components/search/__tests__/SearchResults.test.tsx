import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchResults } from '../SearchResults';
import type { SearchResult } from '@/lib/api/search';

describe('SearchResults', () => {
  const sampleResults: SearchResult[] = [
    {
      id: 'res-1',
      slug: 'chitrakote',
      title: 'Chitrakote Waterfall',
      description: 'Bastar waterfalls.',
      content_type: 'nature',
      district: 'Bastar',
      categories: ['nature'],
      tags: [],
      distance_km: null,
      score: 0.9,
    },
    {
      id: 'res-2',
      slug: 'tirathgarh',
      title: 'Tirathgarh Waterfall',
      description: 'Kanger valley.',
      content_type: 'nature',
      district: 'Bastar',
      categories: ['nature'],
      tags: [],
      distance_km: null,
      score: 0.85,
    },
  ];

  it('renders results count and result cards', () => {
    const handlePageChange = jest.fn();
    render(
      <SearchResults
        results={sampleResults}
        total={2}
        currentPage={1}
        pageSize={10}
        locale="en"
        query="waterfall"
        onPageChange={handlePageChange}
      />,
    );

    expect(screen.getByText(/Found/i)).toBeInTheDocument();
    expect(screen.getByText('Chitrakote Waterfall')).toBeInTheDocument();
    expect(screen.getByText('Tirathgarh Waterfall')).toBeInTheDocument();
  });
});
