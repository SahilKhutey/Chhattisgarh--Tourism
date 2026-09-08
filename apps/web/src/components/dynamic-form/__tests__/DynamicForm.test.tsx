/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DynamicForm } from '../DynamicForm';
import { ContentTemplate } from '../../template-builder/types';

describe('DynamicForm Component', () => {
  const mockTemplate: ContentTemplate = {
    id: 'tpl-1',
    name: 'Waterfall Experience',
    slug: 'waterfall',
    status: 'PUBLISHED',
    version: 1,
    fields: [
      {
        key: 'title',
        label: 'Waterfall Name',
        fieldType: 'TEXT',
        required: true,
        order: 0,
      },
      {
        key: 'description',
        label: 'Story',
        fieldType: 'RICHTEXT',
        required: false,
        order: 1,
      },
      {
        key: 'entryFee',
        label: 'Entry Fee',
        fieldType: 'NUMBER',
        required: false,
        order: 2,
        options: { min: 0, max: 500 },
      },
    ],
  };

  it('renders fields according to template definition', () => {
    render(
      <DynamicForm
        template={mockTemplate}
        onSubmit={jest.fn()}
      />,
    );

    expect(screen.getByText(/Waterfall Name/i)).toBeInTheDocument();
    expect(screen.getByText(/Story/i)).toBeInTheDocument();
    expect(screen.getByText(/Entry Fee/i)).toBeInTheDocument();
  });

  it('validates required fields on submission', async () => {
    const handleSubmit = jest.fn();
    render(
      <DynamicForm
        template={mockTemplate}
        onSubmit={handleSubmit}
      />,
    );

    const submitBtn = screen.getByRole('button', { name: /Submit for Review/i });
    fireEvent.click(submitBtn);

    // Required field validation error
    const errors = await screen.findAllByText(/Waterfall Name is required/i);
    expect(errors.length).toBeGreaterThan(0);
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('submits successfully when required fields are filled', async () => {
    const handleSubmit = jest.fn().mockResolvedValue(undefined);
    render(
      <DynamicForm
        template={mockTemplate}
        onSubmit={handleSubmit}
      />,
    );

    const input = screen.getByPlaceholderText(/Enter waterfall name/i);
    fireEvent.change(input, { target: { value: 'Chitrakote Falls' } });

    const submitBtn = screen.getByRole('button', { name: /Submit for Review/i });
    fireEvent.click(submitBtn);

    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Chitrakote Falls' }),
      'PENDING_REVIEW',
    );
  });
});
