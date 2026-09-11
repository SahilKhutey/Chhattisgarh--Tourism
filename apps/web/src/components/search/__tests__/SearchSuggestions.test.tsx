import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchSuggestions } from '../SearchSuggestions';

describe('SearchSuggestions', () => {
  const sampleSuggestions = [
    { text: 'Sirpur Heritage Site', type: 'heritage', slug: 'sirpur' },
    { text: 'Sirpur Buddhist Complex', type: 'heritage', slug: 'sirpur-complex' },
  ];

  it('renders suggestions with listbox and option semantics', () => {
    const handleSelect = jest.fn();
    render(
      <SearchSuggestions
        suggestions={sampleSuggestions}
        selectedIndex={1}
        onSelect={handleSelect}
      />,
    );

    const listbox = screen.getByRole('listbox');
    expect(listbox).toBeInTheDocument();

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(2);
    expect(options[0]).toHaveAttribute('aria-selected', 'false');
    expect(options[1]).toHaveAttribute('aria-selected', 'true');
  });

  it('triggers onSelect when clicking a suggestion option', () => {
    const handleSelect = jest.fn();
    render(
      <SearchSuggestions
        suggestions={sampleSuggestions}
        selectedIndex={-1}
        onSelect={handleSelect}
      />,
    );

    fireEvent.click(screen.getByText('Sirpur Heritage Site'));
    expect(handleSelect).toHaveBeenCalledWith(sampleSuggestions[0]);
  });
});
