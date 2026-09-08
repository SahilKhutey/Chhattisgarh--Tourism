/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TemplateBuilder } from '../TemplateBuilder';

describe('TemplateBuilder Component', () => {
  it('renders template builder interface with palette and metadata fields', () => {
    render(<TemplateBuilder />);

    expect(screen.getByText('Create Generic Content Template')).toBeInTheDocument();
    expect(screen.getByText('Field Palette')).toBeInTheDocument();
    expect(screen.getByLabelText(/Template Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Unique Slug/i)).toBeInTheDocument();
  });

  it('allows adding fields from palette', () => {
    render(<TemplateBuilder />);

    // Click "Geographic Point" in palette
    const geoBtn = screen.getByRole('button', { name: /Geographic Point/i });
    fireEvent.click(geoBtn);

    expect(screen.getByText('GEO_POINT')).toBeInTheDocument();
  });

  it('toggles schema JSON preview', () => {
    render(<TemplateBuilder />);

    const jsonBtn = screen.getByRole('button', { name: /View Schema JSON/i });
    fireEvent.click(jsonBtn);

    expect(screen.getByText('Canonical Schema JSON')).toBeInTheDocument();
  });
});
