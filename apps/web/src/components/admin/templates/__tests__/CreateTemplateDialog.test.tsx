/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CreateTemplateDialog } from '../CreateTemplateDialog';
import * as templatesApi from '@/lib/api/templates';

jest.mock('@/lib/api/templates', () => ({
  createTemplate: jest.fn(),
}));

describe('CreateTemplateDialog Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when open is false', () => {
    render(
      <CreateTemplateDialog
        open={false}
        onClose={jest.fn()}
        onCreated={jest.fn()}
      />,
    );
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('renders dialog and auto-slugifies name input', () => {
    render(
      <CreateTemplateDialog
        open={true}
        onClose={jest.fn()}
        onCreated={jest.fn()}
      />,
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    const nameInput = screen.getByLabelText('Name');
    const slugInput = screen.getByLabelText('Slug');

    fireEvent.change(nameInput, { target: { value: 'Eco Tourism Trail' } });
    expect(slugInput).toHaveValue('eco-tourism-trail');
  });

  it('validates minimum name length', async () => {
    render(
      <CreateTemplateDialog
        open={true}
        onClose={jest.fn()}
        onCreated={jest.fn()}
      />,
    );

    const nameInput = screen.getByLabelText('Name');
    fireEvent.change(nameInput, { target: { value: 'A' } });

    const submitBtn = screen.getByRole('button', { name: /create template/i });
    fireEvent.click(submitBtn);

    expect(
      await screen.findByText('Template name must contain at least 2 characters.'),
    ).toBeInTheDocument();
    expect(templatesApi.createTemplate).not.toHaveBeenCalled();
  });

  it('submits valid template and calls onCreated', async () => {
    const handleCreated = jest.fn();
    (templatesApi.createTemplate as jest.Mock).mockResolvedValueOnce({
      id: 'mock-tpl-123',
      name: 'Eco Camping',
      slug: 'eco-camping',
    });

    render(
      <CreateTemplateDialog
        open={true}
        onClose={jest.fn()}
        onCreated={handleCreated}
      />,
    );

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Eco Camping' },
    });
    fireEvent.change(screen.getByLabelText('Category'), {
      target: { value: 'adventure' },
    });
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'Camping sites across CG' },
    });

    const submitBtn = screen.getByRole('button', { name: /create template/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(templatesApi.createTemplate).toHaveBeenCalledWith({
        name: 'Eco Camping',
        slug: 'eco-camping',
        category: 'adventure',
        description: 'Camping sites across CG',
      });
      expect(handleCreated).toHaveBeenCalledWith('mock-tpl-123');
    });
  });

  it('handles submission errors and displays error message', async () => {
    (templatesApi.createTemplate as jest.Mock).mockRejectedValueOnce(
      new Error('Slug already exists'),
    );

    render(
      <CreateTemplateDialog
        open={true}
        onClose={jest.fn()}
        onCreated={jest.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Existing Template' },
    });

    const submitBtn = screen.getByRole('button', { name: /create template/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText('Slug already exists')).toBeInTheDocument();
  });
});
