/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DynamicEntryForm, Template } from '../src/components/content/DynamicEntryForm';

describe('Creator DynamicEntryForm Test Suite', () => {
  const sampleTemplate: Template = {
    id: 'tpl-heritage-craft',
    name: 'Tribal Craft',
    slug: 'tribal-craft',
    fields: [
      {
        key: 'craft_name',
        label: 'Craft Name',
        fieldType: 'TEXT',
        required: true,
        helpText: 'The indigenous name of the craft form',
      },
      {
        key: 'artisan_count',
        label: 'Estimated Artisans',
        fieldType: 'NUMBER',
        required: false,
        helpText: 'Approximate active practitioners',
      },
      {
        key: 'heritage_materials',
        label: 'Materials Used',
        fieldType: 'TAGS',
        required: false,
        helpText: 'Comma separated list of raw materials',
      },
      {
        key: 'gi_tagged',
        label: 'Geographical Indication Tagged',
        fieldType: 'BOOLEAN',
        required: false,
      },
      {
        key: 'district_region',
        label: 'Primary District',
        fieldType: 'DROPDOWN',
        required: true,
        options: JSON.stringify({
          choices: [
            { label: 'Bastar', value: 'bastar' },
            { label: 'Kondagaon', value: 'kondagaon' },
            { label: 'Dantewada', value: 'dantewada' },
          ],
        }),
      },
    ],
  };

  it('renders all template fields with appropriate labels and help texts', () => {
    render(React.createElement(DynamicEntryForm, { template: sampleTemplate, onSubmit: jest.fn() }));

    expect(screen.getByRole('heading', { level: 2, name: /Tribal Craft Entry Form/i })).toBeInTheDocument();
    expect(screen.getByText('Craft Name')).toBeInTheDocument();
    expect(screen.getByText('The indigenous name of the craft form')).toBeInTheDocument();
    expect(screen.getByText('Estimated Artisans')).toBeInTheDocument();
    expect(screen.getByText('Materials Used')).toBeInTheDocument();
    expect(screen.getByText('Enable Geographical Indication Tagged')).toBeInTheDocument();
    expect(screen.getByText(/Primary District/i)).toBeInTheDocument();
  });

  it('collects and submits typed field data to onSubmit handler', async () => {
    const handleSubmit = jest.fn();
    render(React.createElement(DynamicEntryForm, { template: sampleTemplate, onSubmit: handleSubmit }));

    // Text field
    const nameInput = screen.getByPlaceholderText(/enter craft name/i);
    fireEvent.change(nameInput, { target: { value: 'Dhokra Brass Art' } });

    // Number field
    const countInput = screen.getByRole('spinbutton');
    fireEvent.change(countInput, { target: { value: '450' } });

    // Tags field
    const tagsInput = screen.getByPlaceholderText(/tag1, tag2, tag3/i);
    fireEvent.change(tagsInput, { target: { value: 'Brass, Beeswax, Clay' } });

    // Boolean checkbox
    const booleanInput = screen.getByRole('checkbox');
    fireEvent.click(booleanInput);

    // Dropdown select
    const dropdownSelect = screen.getByRole('combobox');
    fireEvent.change(dropdownSelect, { target: { value: 'kondagaon' } });

    // Submit form
    const submitBtn = screen.getByRole('button', { name: /Submit for Review/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledTimes(1);
      expect(handleSubmit).toHaveBeenCalledWith({
        craft_name: 'Dhokra Brass Art',
        artisan_count: 450,
        heritage_materials: ['Brass', 'Beeswax', 'Clay'],
        gi_tagged: true,
        district_region: 'kondagaon',
      });
    });
  });

  it('disables submit button and shows loading text during form submission', async () => {
    let finishSubmit: () => void = () => {};
    const deferredSubmit = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          finishSubmit = resolve;
        }),
    );

    render(React.createElement(DynamicEntryForm, { template: sampleTemplate, onSubmit: deferredSubmit }));

    const submitBtn = screen.getByRole('button', { name: /Submit for Review/i });
    fireEvent.click(submitBtn);

    expect(screen.getByRole('button', { name: /Submitting\.\.\./i })).toBeDisabled();

    finishSubmit();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Submit for Review/i })).not.toBeDisabled();
    });
  });
});
