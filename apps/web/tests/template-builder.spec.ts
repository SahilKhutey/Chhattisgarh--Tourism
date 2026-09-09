/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TemplateBuilder } from '../src/components/templates/TemplateBuilder';
import { createTemplate } from '../src/lib/template';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}));

// Mock template api library
jest.mock('../src/lib/template', () => ({
  createTemplate: jest.fn(),
  updateTemplate: jest.fn(),
  publishTemplate: jest.fn(),
  fetchTemplate: jest.fn(),
  fetchTemplates: jest.fn(),
}));

describe('TemplateBuilder Component Test Suite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders initial empty builder with canvas and palette', () => {
    render(React.createElement(TemplateBuilder));

    expect(screen.getByText('New Content Template')).toBeInTheDocument();
    expect(screen.getByText('Field Palette')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e.g. Traditional Festival/i)).toBeInTheDocument();
    expect(screen.getByText('Live Form Preview')).toBeInTheDocument();
  });

  it('automatically derives slug from template name when typing in new mode', () => {
    render(React.createElement(TemplateBuilder));

    const nameInput = screen.getByPlaceholderText(/e.g. Traditional Festival/i);
    const slugInput = screen.getByPlaceholderText(/e.g. traditional-festival/i);

    fireEvent.change(nameInput, { target: { value: 'Bastar Bell Metal Craft' } });

    expect(slugInput).toHaveValue('bastar-bell-metal-craft');
  });

  it('adds fields from the palette to the canvas', () => {
    render(React.createElement(TemplateBuilder));

    // Add a single-line text field
    const textFieldBtn = screen.getByRole('button', { name: /Text Single-line text/i });
    fireEvent.click(textFieldBtn);

    expect(screen.getByText('Template Canvas (1 field)')).toBeInTheDocument();
    expect(screen.getByText('Configure TEXT Field')).toBeInTheDocument();

    // Add a number field
    const numberFieldBtn = screen.getByRole('button', { name: /Number Numeric measurement/i });
    fireEvent.click(numberFieldBtn);

    expect(screen.getByText('Template Canvas (2 fields)')).toBeInTheDocument();
  });

  it('allows editing field settings such as label and required state', () => {
    render(React.createElement(TemplateBuilder));

    // Add a text field
    fireEvent.click(screen.getByRole('button', { name: /Text Single-line text/i }));

    // The inspector opens automatically for the new field
    const labelInput = screen.getByDisplayValue('Text Field');
    fireEvent.change(labelInput, { target: { value: 'Artisan Community Name' } });

    // Label should be updated in the canvas list and preview
    expect(screen.getAllByText('Artisan Community Name').length).toBeGreaterThanOrEqual(1);

    // Toggle required checkbox
    const requiredCheckbox = screen.getByRole('checkbox', { name: /Required field/i });
    expect(requiredCheckbox).not.toBeChecked();
    fireEvent.click(requiredCheckbox);
    expect(requiredCheckbox).toBeChecked();
  });

  it('renders pre-loaded template when editing existing template', () => {
    const existingTemplate: any = {
      id: 'tpl-101',
      name: 'Waterfalls of Bastar',
      slug: 'waterfalls-bastar',
      description: 'Scenic cascading waterfalls',
      icon: 'Waves',
      status: 'DRAFT',
      version: 1,
      fields: [
        {
          key: 'waterfall_name',
          label: 'Waterfall Name',
          type: 'TEXT',
          required: true,
          order: 0,
        },
        {
          key: 'height_meters',
          label: 'Height (Meters)',
          type: 'NUMBER',
          required: false,
          order: 1,
        },
      ],
    };

    render(React.createElement(TemplateBuilder, { initialTemplate: existingTemplate }));

    expect(screen.getByText(/Edit Template: Waterfalls of Bastar/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('Waterfalls of Bastar')).toBeInTheDocument();
    expect(screen.getByDisplayValue('waterfalls-bastar')).toBeInTheDocument();
    expect(screen.getByText('Template Canvas (2 fields)')).toBeInTheDocument();
  });

  it('calls createTemplate API when saving a new template', async () => {
    const mockCreated: any = {
      id: 'new-tpl-1',
      name: 'Chitrakote Echoes',
      slug: 'chitrakote-echoes',
      status: 'DRAFT',
      fields: [],
    };
    (createTemplate as jest.Mock).mockResolvedValue(mockCreated);
    const onSavedMock = jest.fn();

    render(React.createElement(TemplateBuilder, { onSaved: onSavedMock }));

    fireEvent.change(screen.getByPlaceholderText(/e.g. Traditional Festival/i), {
      target: { value: 'Chitrakote Echoes' },
    });

    // Add at least one field so template validation passes
    fireEvent.click(screen.getByRole('button', { name: /Text Single-line text/i }));

    const saveBtn = screen.getByRole('button', { name: /Save Draft/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(createTemplate).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Chitrakote Echoes',
          slug: 'chitrakote-echoes',
        }),
      );
      expect(onSavedMock).toHaveBeenCalledWith(mockCreated);
    });
  });
});
