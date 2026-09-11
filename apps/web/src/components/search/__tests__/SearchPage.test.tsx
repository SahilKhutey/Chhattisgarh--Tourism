import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { SearchPage } from '../SearchPage';

// Mock Next.js navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/en/search',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock search API
jest.mock('@/lib/api/search', () => ({
  searchContent: jest.fn().mockResolvedValue({
    query: 'waterfall',
    locale: 'en',
    page: 1,
    page_size: 18,
    total: 1,
    results: [
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
    ],
    content_types: [],
    districts: [],
    categories: [],
  }),
  fetchDiscoveryLanding: jest.fn().mockResolvedValue({
    featured_destinations: [],
    popular_categories: [{ value: 'nature', count: 10 }],
    popular_districts: [{ value: 'Bastar', count: 15 }],
  }),
  fetchSearchSuggestions: jest.fn().mockResolvedValue([]),
}));

describe('SearchPage', () => {
  it('renders search page hero and discovery landing when query is empty', async () => {
    render(<SearchPage locale="en" />);

    expect(screen.getByText('Explore Chhattisgarh')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Explore by Category')).toBeInTheDocument();
    });
  });

  it('renders search results when query is provided', async () => {
    render(<SearchPage locale="en" query="waterfall" />);

    await waitFor(() => {
      expect(screen.getByText('Chitrakote Waterfall')).toBeInTheDocument();
    });
  });
});
