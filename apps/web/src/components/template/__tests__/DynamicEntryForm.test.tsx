/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DynamicEntryForm } from '../DynamicEntryForm';
import { TemplateFieldModel } from '../../renderer/field-registry';

describe('DynamicEntryForm (Creator Dynamic Form)', () => {
  const fields: TemplateFieldModel[] = [
    {
      key: 'title',
      label: 'Title',
      fieldType: 'TEXT',
      order: 0,
      required: true,
      helpText: 'Official name of the attraction',
    },
    {
      key: 'description',
      label: 'Description',
      fieldType: 'TEXTAREA',
      order: 1,
      required: false,
    },
    {
      key: 'entryFee',
      label: 'Entry Fee',
      fieldType: 'NUMBER',
      order: 2,
      required: false,
    },
    {
      key: 'isActive',
      label: 'Active Attraction',
      fieldType: 'BOOLEAN',
      order: 3,
      required: false,
    },
  ];

  const mockTemplate = {
    id: 'tpl-attraction',
    name: 'Attraction',
    slug: 'attraction',
    fields,
  };

  it('renders all fields with appropriate labels and help text', () => {
    render(<DynamicEntryForm template={mockTemplate} onSubmit={jest.fn()} />);

    expect(screen.getByText(/Title/i)).toBeInTheDocument();
    expect(screen.getByText('Official name of the attraction')).toBeInTheDocument();
    expect(screen.getByText(/Description/i)).toBeInTheDocument();
    expect(screen.getByText(/Entry Fee/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Active Attraction/i).length).toBeGreaterThan(0);
  });

  it('validates required fields and shows error when empty', async () => {
    const handleSubmit = jest.fn();
    render(<DynamicEntryForm template={mockTemplate} onSubmit={handleSubmit} />);

    const submitBtn = screen.getByRole('button', { name: /Submit Content/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText('Title is required')).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with form values when required fields are filled', async () => {
    const handleSubmit = jest.fn();
    render(<DynamicEntryForm template={mockTemplate} onSubmit={handleSubmit} />);

    const titleInput = screen.getByPlaceholderText(/enter title/i);
    fireEvent.change(titleInput, { target: { value: 'Barnawapara Wildlife Sanctuary' } });

    const submitBtn = screen.getByRole('button', { name: /Submit Content/i });
    fireEvent.click(submitBtn);

    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Barnawapara Wildlife Sanctuary',
      }),
    );
  });
});
