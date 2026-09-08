/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SearchBar } from '../SearchBar';

jest.mock('../../../lib/discovery/api', () => ({
  fetchSearchSuggestions: jest.fn().mockResolvedValue(['Chitrakote', 'Chitradhara']),
}));

describe('SearchBar Component', () => {
  it('renders input with placeholder and submit button', () => {
    render(<SearchBar onSearch={jest.fn()} placeholder="Search experiences..." />);
    expect(screen.getByPlaceholderText('Search experiences...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  it('triggers onSearch when form is submitted', () => {
    const handleSearch = jest.fn();
    render(<SearchBar onSearch={handleSearch} />);

    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'waterfall' } });
    fireEvent.submit(screen.getByRole('search'));

    expect(handleSearch).toHaveBeenCalledWith('waterfall');
  });

  it('displays suggestions when typing and selects suggestion on click', async () => {
    const handleSearch = jest.fn();
    render(<SearchBar onSearch={handleSearch} />);

    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'chitra' } });

    await waitFor(() => {
      expect(screen.getByText('Chitrakote')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Chitrakote'));
    expect(handleSearch).toHaveBeenCalledWith('Chitrakote');
  });

  it('clears input when clear button is clicked', () => {
    const handleSearch = jest.fn();
    render(<SearchBar initialValue="initial text" onSearch={handleSearch} />);

    const clearBtn = screen.getByLabelText('Clear search input');
    fireEvent.click(clearBtn);

    const input = screen.getByRole('searchbox') as HTMLInputElement;
    expect(input.value).toBe('');
    expect(handleSearch).toHaveBeenCalledWith('');
  });
});
