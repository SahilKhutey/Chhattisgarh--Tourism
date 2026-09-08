import { validateField, validateEntry } from '../validation';
import { TemplateField } from '../../types/content';

describe('Template Entry Validation', () => {
  it('validates required text fields', () => {
    const field: TemplateField = {
      key: 'title',
      label: 'Title',
      type: 'TEXT',
      required: true,
      order: 0,
    };

    expect(validateField(field, '')).toBe('Title is required');
    expect(validateField(field, null)).toBe('Title is required');
    expect(validateField(field, 'Bastar Dussehra')).toBeNull();
  });

  it('validates text length constraints', () => {
    const field: TemplateField = {
      key: 'code',
      label: 'Code',
      type: 'TEXT',
      required: false,
      order: 0,
      validation: { minLength: 3, maxLength: 5 },
    };

    expect(validateField(field, 'AB')).toBe('Code must be at least 3 characters');
    expect(validateField(field, 'ABCDEF')).toBe('Code cannot exceed 5 characters');
    expect(validateField(field, 'ABCD')).toBeNull();
  });

  it('validates number ranges', () => {
    const field: TemplateField = {
      key: 'elevation',
      label: 'Elevation',
      type: 'NUMBER',
      required: true,
      order: 0,
      validation: { min: 0, max: 2000 },
    };

    expect(validateField(field, 'not-a-number')).toBe('Elevation must be a valid number');
    expect(validateField(field, -10)).toBe('Elevation must be at least 0');
    expect(validateField(field, 2500)).toBe('Elevation cannot exceed 2000');
    expect(validateField(field, 500)).toBeNull();
  });

  it('validates GEO_POINT coordinates and bounds', () => {
    const field: TemplateField = {
      key: 'location',
      label: 'Coordinates',
      type: 'GEO_POINT',
      required: true,
      order: 0,
    };

    expect(validateField(field, null)).toBe('Coordinates is required');
    expect(validateField(field, { lat: 100, lng: 81.63 })).toBe(
      'Coordinates latitude must be between -90 and 90',
    );
    expect(validateField(field, { lat: 21.25, lng: 200 })).toBe(
      'Coordinates longitude must be between -180 and 180',
    );
    expect(validateField(field, { lat: 21.25, lng: 81.63 })).toBeNull();
  });

  it('validates DROPDOWN options', () => {
    const field: TemplateField = {
      key: 'season',
      label: 'Best Season',
      type: 'DROPDOWN',
      required: true,
      order: 0,
      options: [
        { label: 'Winter', value: 'winter' },
        { label: 'Monsoon', value: 'monsoon' },
      ],
    };

    expect(validateField(field, 'summer')).toBe('Best Season has an invalid selection');
    expect(validateField(field, 'winter')).toBeNull();
  });

  it('validates an entire entry with multiple fields', () => {
    const fields: TemplateField[] = [
      {
        key: 'name',
        label: 'Name',
        type: 'TEXT',
        required: true,
        order: 0,
      },
      {
        key: 'rating',
        label: 'Rating',
        type: 'NUMBER',
        required: true,
        order: 1,
        validation: { min: 1, max: 5 },
      },
    ];

    const errors = validateEntry(fields, { name: '', rating: 10 });
    expect(errors.name).toBe('Name is required');
    expect(errors.rating).toBe('Rating cannot exceed 5');

    const validErrors = validateEntry(fields, { name: 'Chitrakote Falls', rating: 5 });
    expect(Object.keys(validErrors)).toHaveLength(0);
  });
});
