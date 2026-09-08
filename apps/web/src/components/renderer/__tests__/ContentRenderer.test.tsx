/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ContentRenderer } from '../ContentRenderer';
import { TemplateFieldModel } from '../field-registry';

// Mock GenericMap to prevent leaflet canvas / DOM issues in jsdom
jest.mock('../../content/GenericMap', () => ({
  GenericMap: ({ title, lat, lng }: any) => (
    <div data-testid="mock-generic-map">
      Map for {title} at {lat}, {lng}
    </div>
  ),
}));

describe('ContentRenderer (Canonical Generic Engine)', () => {
  const fields: TemplateFieldModel[] = [
    { key: 'title', label: 'Title', fieldType: 'TEXT', order: 0, required: true },
    { key: 'description', label: 'Description', fieldType: 'TEXTAREA', order: 1 },
    { key: 'story', label: 'Cultural Story', fieldType: 'RICHTEXT', order: 2 },
    { key: 'altitude', label: 'Altitude (meters)', fieldType: 'NUMBER', order: 3 },
    { key: 'isAccessible', label: 'Wheelchair Accessible', fieldType: 'BOOLEAN', order: 4 },
    { key: 'eventDate', label: 'Festival Date', fieldType: 'DATE', order: 5 },
    { key: 'tags', label: 'Keywords', fieldType: 'TAGS', order: 6 },
    { key: 'emptyField', label: 'Empty Text', fieldType: 'TEXT', order: 7 },
  ];

  const mockEntry = {
    id: 'entry-1',
    title: 'Mainpat Hill Station',
    slug: 'mainpat-hill-station',
    district: 'Surguja',
    region: 'Surguja',
    lat: 22.81,
    lng: 83.28,
    publishedAt: '2026-09-08T10:00:00.000Z',
    template: {
      id: 'tpl-destination',
      name: 'Destination',
      slug: 'destination',
      version: 1,
      fields,
    },
    data: {
      title: 'Mainpat Hill Station',
      description: 'Often referred to as the Shimla of Chhattisgarh with Tibetan settlements.',
      story: '<p>Mainpat hosts a unique <em>Tibetan monastery</em> and verdant rolling hills.</p>',
      altitude: 1152,
      isAccessible: true,
      eventDate: '2026-10-15',
      tags: ['hills', 'tibetan', 'surguja'],
      emptyField: '',
    },
  };

  it('renders title, template badge, and district correctly', () => {
    render(<ContentRenderer entry={mockEntry} />);

    expect(screen.getByRole('heading', { level: 1, name: /Mainpat Hill Station/i })).toBeInTheDocument();
    expect(screen.getByText('Destination')).toBeInTheDocument();
    expect(screen.getByText('Surguja')).toBeInTheDocument();
  });

  it('renders registered field types according to template order', () => {
    render(<ContentRenderer entry={mockEntry} />);

    // Text & Textarea
    expect(screen.getByText(/Often referred to as the Shimla of Chhattisgarh/i)).toBeInTheDocument();

    // Richtext sanitized
    expect(screen.getByText(/Tibetan monastery/i)).toBeInTheDocument();

    // Number
    expect(screen.getByText('1,152')).toBeInTheDocument();

    // Boolean
    expect(screen.getByText(/Wheelchair Accessible: Yes/i)).toBeInTheDocument();

    // Tags
    expect(screen.getByText('#hills')).toBeInTheDocument();
    expect(screen.getByText('#tibetan')).toBeInTheDocument();
  });

  it('omits empty fields from output', () => {
    render(<ContentRenderer entry={mockEntry} />);

    expect(screen.queryByText('Empty Text')).not.toBeInTheDocument();
  });

  it('renders trailing geographic map when coordinates are provided', () => {
    render(<ContentRenderer entry={mockEntry} />);

    expect(screen.getByTestId('mock-generic-map')).toBeInTheDocument();
    expect(screen.getByText(/Lat: 22.810000 | Lng: 83.280000/i)).toBeInTheDocument();
  });
});
