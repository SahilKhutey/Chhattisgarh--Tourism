/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SearchResultCard } from '../SearchResultCard';
import { DiscoveryResult } from '../../../lib/discovery/types';

describe('SearchResultCard Component', () => {
  const mockItem: DiscoveryResult = {
    id: 'entry-123',
    templateId: 'tpl-festival',
    templateName: 'Festival',
    templateSlug: 'festival',
    slug: 'bastar-dussehra',
    title: 'Bastar Dussehra Carnival',
    region: 'Bastar',
    district: 'Jagdalpur',
    division: 'Bastar',
    lat: 19.07,
    lng: 82.02,
    tags: ['tribal', 'carnival', 'culture'],
    data: {
      title: 'Bastar Dussehra Carnival',
      heroImage: 'https://images.cg-tourism.in/festivals/dussehra.jpg',
    },
  };

  it('renders template badge, title with correct link, and location', () => {
    render(<SearchResultCard item={mockItem} />);

    expect(screen.getByText('Festival')).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /Bastar Dussehra Carnival/i });
    expect(link).toHaveAttribute('href', '/content/festival/bastar-dussehra');
    expect(screen.getByText(/Jagdalpur, Bastar/i)).toBeInTheDocument();
  });

  it('renders tags and image thumbnail when available', () => {
    render(<SearchResultCard item={mockItem} />);

    expect(screen.getByText('tribal')).toBeInTheDocument();
    expect(screen.getByText('carnival')).toBeInTheDocument();

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://images.cg-tourism.in/festivals/dussehra.jpg');
  });

  it('renders fallback header when thumbnail is not present', () => {
    const itemWithoutImg: DiscoveryResult = {
      ...mockItem,
      data: { title: 'No image festival' },
    };

    render(<SearchResultCard item={itemWithoutImg} />);
    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.getByText('Festival')).toBeInTheDocument();
  });
});
