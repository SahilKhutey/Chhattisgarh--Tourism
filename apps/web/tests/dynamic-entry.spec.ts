/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DynamicFieldRenderer } from '../src/components/content/DynamicFieldRenderer';
import { DynamicEntryPage } from '../src/components/content/DynamicEntryPage';

// Mock GenericMap to avoid canvas/leaflet issues in jsdom
jest.mock('../src/components/content/GenericMap', () => ({
  GenericMap: ({ lat, lng, title }: { lat: number; lng: number; title: string }) =>
    React.createElement(
      'div',
      { 'data-testid': 'mock-generic-map' },
      `Map: ${title} (${lat}, ${lng})`,
    ),
}));

describe('DynamicFieldRenderer & DynamicEntryPage Test Suite', () => {
  describe('DynamicFieldRenderer', () => {
    it('renders and handles TEXT field changes', () => {
      const onChange = jest.fn();
      render(
        React.createElement(DynamicFieldRenderer, {
          field: { key: 'attraction_name', label: 'Attraction Name', fieldType: 'TEXT', required: true },
          value: 'Kanger Valley',
          onChange,
        }),
      );

      const input = screen.getByDisplayValue('Kanger Valley');
      fireEvent.change(input, { target: { value: 'Kanger Ghati National Park' } });
      expect(onChange).toHaveBeenCalledWith('Kanger Ghati National Park');
    });

    it('renders and handles NUMBER field changes', () => {
      const onChange = jest.fn();
      render(
        React.createElement(DynamicFieldRenderer, {
          field: { key: 'elevation', label: 'Elevation', fieldType: 'NUMBER', required: false },
          value: 600,
          onChange,
        }),
      );

      const input = screen.getByDisplayValue('600');
      fireEvent.change(input, { target: { value: '750' } });
      expect(onChange).toHaveBeenCalledWith(750);
    });

    it('renders and handles BOOLEAN field changes', () => {
      const onChange = jest.fn();
      render(
        React.createElement(DynamicFieldRenderer, {
          field: { key: 'is_unesco', label: 'UNESCO Heritage Site', fieldType: 'BOOLEAN', required: false },
          value: false,
          onChange,
        }),
      );

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();
      fireEvent.click(checkbox);
      expect(onChange).toHaveBeenCalledWith(true);
    });

    it('renders and handles DROPDOWN field choices', () => {
      const onChange = jest.fn();
      const options = JSON.stringify({
        choices: [
          { label: 'Ecological', value: 'eco' },
          { label: 'Historical', value: 'hist' },
        ],
      });

      render(
        React.createElement(DynamicFieldRenderer, {
          field: { key: 'category', label: 'Category', fieldType: 'DROPDOWN', required: true, options },
          value: 'eco',
          onChange,
        }),
      );

      const select = screen.getByRole('combobox');
      expect(select).toHaveValue('eco');
      fireEvent.change(select, { target: { value: 'hist' } });
      expect(onChange).toHaveBeenCalledWith('hist');
    });

    it('renders and parses TAGS field comma-separated input', () => {
      const onChange = jest.fn();
      render(
        React.createElement(DynamicFieldRenderer, {
          field: { key: 'features', label: 'Features', fieldType: 'TAGS', required: false },
          value: ['Forest', 'Caves'],
          onChange,
        }),
      );

      const input = screen.getByDisplayValue('Forest, Caves');
      fireEvent.change(input, { target: { value: 'Forest, Caves, Waterfalls' } });
      expect(onChange).toHaveBeenCalledWith(['Forest', 'Caves', 'Waterfalls']);
    });
  });

  describe('DynamicEntryPage', () => {
    const sampleTemplate = {
      name: 'Eco Destination',
      fields: [
        { key: 'title', label: 'Destination Title', fieldType: 'TEXT', order: 0 },
        { key: 'hero_image', label: 'Hero Image', fieldType: 'IMAGE', order: 1 },
        { key: 'description', label: 'Overview', fieldType: 'RICHTEXT', order: 2 },
        { key: 'best_season', label: 'Best Visiting Season', fieldType: 'TEXT', order: 3 },
      ],
    };

    const sampleEntry = {
      latitude: 18.88,
      longitude: 81.87,
      data: {
        title: 'Tirathgarh Falls',
        hero_image: 'https://images.cg-tourism.in/tirathgarh.jpg',
        description: '<p>A majestic 300-foot multi-tiered waterfall nestled in Kanger Valley.</p>',
        best_season: 'October to February',
      },
    };

    it('renders the complete dynamic entry page with title, hero, fields and map', () => {
      render(
        React.createElement(DynamicEntryPage, {
          template: sampleTemplate,
          entry: sampleEntry,
        }),
      );

      expect(screen.getByRole('heading', { level: 1, name: /Tirathgarh Falls/i })).toBeInTheDocument();
      expect(screen.getByText('Eco Destination')).toBeInTheDocument();
      expect(screen.getByText('Best Visiting Season')).toBeInTheDocument();
      expect(screen.getByText('October to February')).toBeInTheDocument();

      // Verify sanitized description text
      expect(screen.getByText(/majestic 300-foot multi-tiered waterfall/i)).toBeInTheDocument();

      // Verify coordinate display and location header
      expect(screen.getByText('Geographic Location')).toBeInTheDocument();
      expect(screen.getByText(/Coordinates:\s*18\.880000,\s*81\.870000/i)).toBeInTheDocument();
    });
  });
});
