import {
  TemplateDefinitionValidator,
  TemplateDefinition,
} from '../template-definition.validator';
import { BadRequestException } from '@nestjs/common';

describe('TemplateDefinitionValidator', () => {
  const validDefinition: TemplateDefinition = {
    name: 'Tribal Craft Center',
    slug: 'tribal-craft-center',
    description: 'Centers showcasing indigenous Dhokra and Bell Metal art',
    fields: [
      {
        key: 'craft_name',
        label: 'Craft Name',
        fieldType: 'TEXT',
        required: true,
      },
      {
        key: 'geo_location',
        label: 'Location Pin',
        fieldType: 'GEO_POINT',
        required: true,
      },
      {
        key: 'craft_category',
        label: 'Category',
        fieldType: 'DROPDOWN',
        options: [
          { label: 'Metal Casting', value: 'metal_casting' },
          { label: 'Terracotta', value: 'terracotta' },
        ],
      },
    ],
  };

  it('validates a correct template definition without errors', () => {
    const result = TemplateDefinitionValidator.validate(validDefinition);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('fails if template name is missing or empty', () => {
    const invalid = { ...validDefinition, name: '  ' };
    const result = TemplateDefinitionValidator.validate(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('name is required'))).toBe(true);
  });

  it('fails if template slug is invalid format', () => {
    const invalid = { ...validDefinition, slug: 'Invalid Slug With Spaces' };
    const result = TemplateDefinitionValidator.validate(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('slug must contain only'))).toBe(true);
  });

  it('fails if fields array is empty', () => {
    const invalid = { ...validDefinition, fields: [] };
    const result = TemplateDefinitionValidator.validate(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('at least one field'))).toBe(true);
  });

  it('detects duplicate field keys', () => {
    const invalid = {
      ...validDefinition,
      fields: [
        { key: 'title', label: 'Title 1', fieldType: 'TEXT' },
        { key: 'title', label: 'Title 2', fieldType: 'TEXT' },
      ],
    };
    const result = TemplateDefinitionValidator.validate(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('duplicate field key "title"'))).toBe(true);
  });

  it('detects invalid field types', () => {
    const invalid = {
      ...validDefinition,
      fields: [
        { key: 'unknown', label: 'Unknown Field', fieldType: 'UNSUPPORTED_TYPE' },
      ],
    };
    const result = TemplateDefinitionValidator.validate(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('invalid fieldType'))).toBe(true);
  });

  it('validates that DROPDOWN fields have non-empty options', () => {
    const invalid = {
      ...validDefinition,
      fields: [
        { key: 'district', label: 'District', fieldType: 'DROPDOWN', options: [] },
      ],
    };
    const result = TemplateDefinitionValidator.validate(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('must define at least one option'))).toBe(
      true,
    );
  });

  it('throws BadRequestException when calling validateOrThrow on invalid definition', () => {
    const invalid = { ...validDefinition, name: '' };
    expect(() => TemplateDefinitionValidator.validateOrThrow(invalid)).toThrow(
      BadRequestException,
    );
  });
});
