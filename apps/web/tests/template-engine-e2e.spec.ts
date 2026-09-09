/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DynamicEntryForm } from '../src/components/content/DynamicEntryForm';
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

describe('Template Engine End-to-End Dynamic Content Lifecycle Flow', () => {
  it('executes full pipeline: template specification -> dynamic authoring -> review state -> generic rendering', async () => {
    // 1. Template Definition
    const tribalFestivalTemplate = {
      id: 'tpl-tribal-festival',
      name: 'Tribal Festival',
      slug: 'tribal-festival',
      fields: [
        {
          key: 'title',
          label: 'Festival Name',
          fieldType: 'TEXT',
          required: true,
          order: 0,
        },
        {
          key: 'hero_image',
          label: 'Banner Image',
          fieldType: 'IMAGE',
          required: false,
          order: 1,
        },
        {
          key: 'celebration_month',
          label: 'Celebration Month',
          fieldType: 'TEXT',
          required: true,
          order: 2,
        },
        {
          key: 'significance',
          label: 'Cultural Significance',
          fieldType: 'RICHTEXT',
          required: true,
          order: 3,
        },
      ],
    };

    // 2. Creator Authors Entry using DynamicEntryForm
    let submittedPayload: Record<string, unknown> | null = null;
    const { unmount: unmountForm } = render(
      React.createElement(DynamicEntryForm, {
        template: tribalFestivalTemplate,
        onSubmit: (data: Record<string, unknown>) => {
          submittedPayload = data;
        },
      }),
    );

    // Enter form details
    fireEvent.change(screen.getByPlaceholderText(/enter festival name/i), {
      target: { value: 'Bastar Goncha Festival' },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter banner image/i), {
      target: { value: 'https://images.cg-tourism.in/festivals/goncha.jpg' },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter celebration month/i), {
      target: { value: 'Ashadha (June-July)' },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter cultural significance/i), {
      target: {
        value: '<p>The ancient chariot festival honoring Lord Jagannath, featuring traditional Tupki bamboo pistols.</p>',
      },
    });

    // Submit the entry
    fireEvent.click(screen.getByRole('button', { name: /Submit for Review/i }));

    await waitFor(() => {
      expect(submittedPayload).toEqual({
        title: 'Bastar Goncha Festival',
        hero_image: 'https://images.cg-tourism.in/festivals/goncha.jpg',
        celebration_month: 'Ashadha (June-July)',
        significance: '<p>The ancient chariot festival honoring Lord Jagannath, featuring traditional Tupki bamboo pistols.</p>',
      });
    });

    unmountForm();

    // 3. Simulated Moderation Review
    const approvedContentEntry = {
      id: 'entry-goncha-101',
      templateId: tribalFestivalTemplate.id,
      slug: 'bastar-goncha-festival',
      status: 'PUBLISHED',
      latitude: 19.07,
      longitude: 82.02,
      data: submittedPayload!,
    };

    expect(approvedContentEntry.status).toBe('PUBLISHED');

    // 4. Public Dynamic Renderer displays the approved entry
    render(
      React.createElement(DynamicEntryPage, {
        template: tribalFestivalTemplate,
        entry: approvedContentEntry,
      }),
    );

    // Verify Title
    expect(screen.getByRole('heading', { level: 1, name: /Bastar Goncha Festival/i })).toBeInTheDocument();
    // Verify Template Badge
    expect(screen.getByText('Tribal Festival')).toBeInTheDocument();
    // Verify Field values rendered dynamically
    expect(screen.getByText('Celebration Month')).toBeInTheDocument();
    expect(screen.getByText('Ashadha (June-July)')).toBeInTheDocument();
    expect(screen.getByText(/chariot festival honoring Lord Jagannath/i)).toBeInTheDocument();
    // Verify Geographic Map & Coordinates
    expect(screen.getByText('Geographic Location')).toBeInTheDocument();
    expect(screen.getByText(/Coordinates:\s*19\.070000,\s*82\.020000/i)).toBeInTheDocument();
  });
});
