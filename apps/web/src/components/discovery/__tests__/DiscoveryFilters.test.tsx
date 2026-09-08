/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DiscoveryFilters } from '../DiscoveryFilters';
import { ContentTemplate } from '../../../types/content';

describe('DiscoveryFilters Component', () => {
  const mockTemplates: ContentTemplate[] = [
    {
      id: 'tpl-1',
      name: 'Destination',
      slug: 'destination',
      status: 'PUBLISHED',
      version: 1,
      fields: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'tpl-2',
      name: 'Tribal Story',
      slug: 'tribal-story',
      status: 'PUBLISHED',
      version: 1,
      fields: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  it('renders template filter buttons and triggers callback on click', () => {
    const handleTemplateChange = jest.fn();
    render(
      <DiscoveryFilters
        templates={mockTemplates}
        onTemplateChange={handleTemplateChange}
        onDistrictChange={jest.fn()}
        onRegionChange={jest.fn()}
        onReset={jest.fn()}
      />,
    );

    expect(screen.getByText('All Types')).toBeInTheDocument();
    expect(screen.getByText('Destination')).toBeInTheDocument();
    expect(screen.getByText('Tribal Story')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Destination'));
    expect(handleTemplateChange).toHaveBeenCalledWith('tpl-1');
  });

  it('renders district and region dropdowns and handles selection', () => {
    const handleDistrictChange = jest.fn();
    const handleRegionChange = jest.fn();

    render(
      <DiscoveryFilters
        templates={mockTemplates}
        onTemplateChange={jest.fn()}
        onDistrictChange={handleDistrictChange}
        onRegionChange={handleRegionChange}
        onReset={jest.fn()}
      />,
    );

    const districtSelect = screen.getByRole('combobox', { name: /district/i });
    fireEvent.change(districtSelect, { target: { value: 'Bastar' } });
    expect(handleDistrictChange).toHaveBeenCalledWith('Bastar');

    const regionSelect = screen.getByRole('combobox', { name: /division \/ region/i });
    fireEvent.change(regionSelect, { target: { value: 'Bastar' } });
    expect(handleRegionChange).toHaveBeenCalledWith('Bastar');
  });

  it('shows Reset button only when active filters exist', () => {
    const handleReset = jest.fn();
    const { rerender } = render(
      <DiscoveryFilters
        templates={mockTemplates}
        onTemplateChange={jest.fn()}
        onDistrictChange={jest.fn()}
        onRegionChange={jest.fn()}
        onReset={handleReset}
      />,
    );

    expect(screen.queryByText(/reset/i)).toBeNull();

    rerender(
      <DiscoveryFilters
        templates={mockTemplates}
        selectedDistrict="Bastar"
        onTemplateChange={jest.fn()}
        onDistrictChange={jest.fn()}
        onRegionChange={jest.fn()}
        onReset={handleReset}
      />,
    );

    const resetBtn = screen.getByText(/reset/i);
    expect(resetBtn).toBeInTheDocument();
    fireEvent.click(resetBtn);
    expect(handleReset).toHaveBeenCalled();
  });
});
