/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TemplateFilters } from '../TemplateFilters';

describe('TemplateFilters Component', () => {
  it('renders filter controls and handles input changes', () => {
    const handleSearchChange = jest.fn();
    const handleStatusChange = jest.fn();
    const handleCategoryChange = jest.fn();

    render(
      <TemplateFilters
        search=""
        status=""
        category=""
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusChange}
        onCategoryChange={handleCategoryChange}
      />,
    );

    const searchInput = screen.getByLabelText('Search templates');
    expect(searchInput).toBeInTheDocument();
    fireEvent.change(searchInput, { target: { value: 'Bastar' } });
    expect(handleSearchChange).toHaveBeenCalledWith('Bastar');

    const statusSelect = screen.getByLabelText('Filter by status');
    expect(statusSelect).toBeInTheDocument();
    fireEvent.change(statusSelect, { target: { value: 'PUBLISHED' } });
    expect(handleStatusChange).toHaveBeenCalledWith('PUBLISHED');

    const categoryInput = screen.getByLabelText('Filter by category');
    expect(categoryInput).toBeInTheDocument();
    fireEvent.change(categoryInput, { target: { value: 'heritage' } });
    expect(handleCategoryChange).toHaveBeenCalledWith('heritage');
  });

  it('populates initial values correctly', () => {
    render(
      <TemplateFilters
        search="Temple"
        status="DRAFT"
        category="culture"
        onSearchChange={jest.fn()}
        onStatusChange={jest.fn()}
        onCategoryChange={jest.fn()}
      />,
    );

    expect(screen.getByLabelText('Search templates')).toHaveValue('Temple');
    expect(screen.getByLabelText('Filter by status')).toHaveValue('DRAFT');
    expect(screen.getByLabelText('Filter by category')).toHaveValue('culture');
  });
});
