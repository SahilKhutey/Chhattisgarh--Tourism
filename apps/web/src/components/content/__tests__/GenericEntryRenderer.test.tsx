/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GenericEntryRenderer } from '../GenericEntryRenderer';

// Mock GenericMap to avoid canvas/leaflet issues in jsdom
jest.mock('../GenericMap', () => {
  return function MockGenericMap({ lat, lng, title }: { lat: number; lng: number; title: string }) {
    return (
      <div data-testid="mock-generic-map">
        Map: {title} ({lat}, {lng})
      </div>
    );
  };
});

describe('GenericEntryRenderer', () => {
  const arbitraryTemplate = {
    name: 'Tribal Craft',
    fields: [
      { key: 'title', label: 'Craft Title', fieldType: 'TEXT', order: 1 },
      { key: 'description', label: 'Detailed Description', fieldType: 'RICHTEXT', order: 2 },
      { key: 'hero', label: 'Hero Image', fieldType: 'IMAGE', order: 3 },
      { key: 'community', label: 'Artisan Community', fieldType: 'TEXT', order: 4 },
      { key: 'tags', label: 'Craft Categories', fieldType: 'TAGS', order: 5 },
      { key: 'certified', label: 'GI Tag Certified', fieldType: 'BOOLEAN', order: 6 },
      { key: 'optionalNotes', label: 'Optional Notes', fieldType: 'TEXT', order: 7 },
      { key: 'gallery', label: 'Craft Showcase', fieldType: 'GALLERY', order: 8 },
    ],
  };

  const arbitraryEntry = {
    id: 'entry-craft-1',
    slug: 'bastar-dhokra-bell-metal',
    lat: 19.07,
    lng: 82.02,
    data: {
      title: 'Bastar Dhokra Bell Metal',
      description: '<p>Ancient lost-wax casting technique.</p><script>alert("malicious")</script>',
      hero: 'https://images.cg-tourism.in/crafts/dhokra.jpg',
      community: 'Ghadwa Artisans',
      tags: ['Dhokra', 'Bell Metal', 'Tribal Art'],
      certified: true,
      optionalNotes: '', // Empty field, should be omitted
      gallery: [
        'https://images.cg-tourism.in/crafts/dhokra-1.jpg',
        'https://images.cg-tourism.in/crafts/dhokra-2.jpg',
      ],
    },
  };

  it('renders arbitrary template structure without hardcoded types', () => {
    render(<GenericEntryRenderer template={arbitraryTemplate} entry={arbitraryEntry} />);

    expect(screen.getByRole('heading', { level: 1, name: /Bastar Dhokra Bell Metal/i })).toBeInTheDocument();
    expect(screen.getByText('Tribal Craft')).toBeInTheDocument();
    expect(screen.getByText('Artisan Community')).toBeInTheDocument();
    expect(screen.getByText('Ghadwa Artisans')).toBeInTheDocument();
  });

  it('sanitizes rich text output using DOMPurify', () => {
    const { container } = render(
      <GenericEntryRenderer template={arbitraryTemplate} entry={arbitraryEntry} />,
    );

    expect(screen.getByText('Ancient lost-wax casting technique.')).toBeInTheDocument();
    // Ensure script tag was completely stripped
    expect(container.querySelector('script')).toBeNull();
    expect(screen.queryByText(/malicious/i)).toBeNull();
  });

  it('omits fields that have empty or undefined values', () => {
    render(<GenericEntryRenderer template={arbitraryTemplate} entry={arbitraryEntry} />);

    // 'Optional Notes' field was empty string, so label and section should NOT be rendered
    expect(screen.queryByText('Optional Notes')).toBeNull();
  });

  it('renders tags, boolean values, and galleries correctly', () => {
    render(<GenericEntryRenderer template={arbitraryTemplate} entry={arbitraryEntry} />);

    expect(screen.getByText('Dhokra')).toBeInTheDocument();
    expect(screen.getByText('Bell Metal')).toBeInTheDocument();
    expect(screen.getByText('Tribal Art')).toBeInTheDocument();
    expect(screen.getByText('GI Tag Certified')).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument();

    const images = screen.getAllByRole('img');
    // Hero image + 2 gallery images = 3
    expect(images.length).toBe(3);
  });

  it('renders interactive map when geographic coordinates are present', () => {
    render(<GenericEntryRenderer template={arbitraryTemplate} entry={arbitraryEntry} />);

    expect(screen.getByText('Geographic Location')).toBeInTheDocument();
    expect(screen.getByTestId('mock-generic-map')).toBeInTheDocument();
    expect(screen.getByText(/19.0700, 82.0200/)).toBeInTheDocument();
  });
});
