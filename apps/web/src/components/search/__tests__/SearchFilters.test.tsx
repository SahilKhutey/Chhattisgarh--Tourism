import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchFilters } from '../SearchFilters';

describe('SearchFilters', () => {
  const sampleDistricts = [
    { value: 'Bastar', count: 12 },
    { value: 'Raipur', count: 8 },
  ];
  const sampleCategories = [
    { value: 'nature', count: 15 },
    { value: 'heritage', count: 7 },
  ];
  const sampleTypes = [{ value: 'destination', count: 20 }];

  it('renders filters and allows changing district and category', () => {
    const handleFilterChange = jest.fn();
    render(
      <SearchFilters
        districts={sampleDistricts}
        categories={sampleCategories}
        contentTypes={sampleTypes}
        onFilterChange={handleFilterChange}
      />,
    );

    const districtSelect = screen.getByLabelText('Filter by district');
    expect(districtSelect).toBeInTheDocument();

    fireEvent.change(districtSelect, { target: { value: 'Bastar' } });
    expect(handleFilterChange).toHaveBeenCalledWith({
      district: 'Bastar',
      category: undefined,
      contentType: undefined,
    });
  });

  it('shows clear filters button when filter is active and clears filters on click', () => {
    const handleFilterChange = jest.fn();
    render(
      <SearchFilters
        district="Bastar"
        districts={sampleDistricts}
        categories={sampleCategories}
        contentTypes={sampleTypes}
        onFilterChange={handleFilterChange}
      />,
    );

    const clearBtn = screen.getByRole('button', { name: /clear filters/i });
    expect(clearBtn).toBeInTheDocument();

    fireEvent.click(clearBtn);
    expect(handleFilterChange).toHaveBeenCalledWith({
      district: undefined,
      category: undefined,
      contentType: undefined,
    });
  });
});
