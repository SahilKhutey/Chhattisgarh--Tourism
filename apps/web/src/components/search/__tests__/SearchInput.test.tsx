import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchInput } from '../SearchInput';

// Mock fetchSearchSuggestions
jest.mock('@/lib/api/search', () => ({
  fetchSearchSuggestions: jest.fn().mockResolvedValue([
    { text: 'Chitrakote Waterfall', type: 'nature', slug: 'chitrakote' },
  ]),
}));

describe('SearchInput', () => {
  it('renders input with accessible label and placeholder', () => {
    const handleSearch = jest.fn();
    render(<SearchInput onSearch={handleSearch} placeholder="Search places..." />);

    const input = screen.getByRole('combobox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', 'Search places...');
    expect(screen.getByLabelText('Search tourism')).toBeInTheDocument();
  });

  it('submits search on Enter key and form submit button', () => {
    const handleSearch = jest.fn();
    render(<SearchInput onSearch={handleSearch} initialValue="Sirpur" />);

    const submitBtn = screen.getByRole('button', { name: 'Search' });
    fireEvent.click(submitBtn);

    expect(handleSearch).toHaveBeenCalledWith('Sirpur');
  });

  it('clears query when clicking clear button', () => {
    const handleSearch = jest.fn();
    render(<SearchInput onSearch={handleSearch} initialValue="Bastar" />);

    const clearBtn = screen.getByRole('button', { name: 'Clear search query' });
    expect(clearBtn).toBeInTheDocument();

    fireEvent.click(clearBtn);
    expect(handleSearch).toHaveBeenCalledWith('');
  });
});
