import { BadRequestException } from '@nestjs/common';
import { FieldType, TemplateField } from '@prisma/client';
import { TemplateValidatorService } from '../template-validator.service';

describe('TemplateValidatorService', () => {
  let validator: TemplateValidatorService;

  beforeEach(() => {
    validator = new TemplateValidatorService();
  });

  const mockField = (partial: Partial<TemplateField>): TemplateField => ({
    id: 'f1',
    templateId: 't1',
    key: 'title',
    label: 'Title',
    fieldType: FieldType.TEXT,
    required: true,
    order: 1,
    options: null,
    helpText: null,
    translatable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...partial,
  });

  it('validates correct text field successfully', () => {
    const fields = [
      mockField({ key: 'title', label: 'Title', fieldType: FieldType.TEXT, required: true }),
    ];

    expect(() => {
      validator.validate(fields, { title: 'Bastar Palace' });
    }).not.toThrow();
  });

  it('throws BadRequestException if required field is missing', () => {
    const fields = [
      mockField({ key: 'title', label: 'Title', required: true }),
    ];

    expect(() => {
      validator.validate(fields, {});
    }).toThrow(BadRequestException);
  });

  it('throws BadRequestException on unknown fields', () => {
    const fields = [
      mockField({ key: 'title', label: 'Title', required: false }),
    ];

    expect(() => {
      validator.validate(fields, { unknownField: 'hacked' });
    }).toThrow(BadRequestException);
  });

  it('validates number min/max rules', () => {
    const fields = [
      mockField({
        key: 'entryFee',
        label: 'Entry Fee',
        fieldType: FieldType.NUMBER,
        options: { min: 0, max: 500 } as any,
      }),
    ];

    // Valid
    expect(() => {
      validator.validate(fields, { entryFee: 50 });
    }).not.toThrow();

    // Below min
    expect(() => {
      validator.validate(fields, { entryFee: -10 });
    }).toThrow(BadRequestException);

    // Above max
    expect(() => {
      validator.validate(fields, { entryFee: 1000 });
    }).toThrow(BadRequestException);
  });

  it('validates GEO_POINT coordinates properly', () => {
    const fields = [
      mockField({
        key: 'coordinates',
        label: 'Location',
        fieldType: FieldType.GEO_POINT,
        required: true,
      }),
    ];

    // Valid
    expect(() => {
      validator.validate(fields, {
        coordinates: { lat: 19.07, lng: 81.96 },
      });
    }).not.toThrow();

    // Invalid lat (> 90)
    expect(() => {
      validator.validate(fields, {
        coordinates: { lat: 95.0, lng: 81.96 },
      });
    }).toThrow(BadRequestException);

    // Invalid structure
    expect(() => {
      validator.validate(fields, {
        coordinates: 'invalid string',
      });
    }).toThrow(BadRequestException);
  });

  it('validates DROPDOWN options', () => {
    const fields = [
      mockField({
        key: 'difficulty',
        label: 'Difficulty',
        fieldType: FieldType.DROPDOWN,
        options: {
          options: [
            { label: 'Easy', value: 'EASY' },
            { label: 'Moderate', value: 'MODERATE' },
          ],
        } as any,
      }),
    ];

    // Valid
    expect(() => {
      validator.validate(fields, { difficulty: 'EASY' });
    }).not.toThrow();

    // Invalid option
    expect(() => {
      validator.validate(fields, { difficulty: 'EXTREME' });
    }).toThrow(BadRequestException);
  });

  it('validates MULTISELECT and TAGS array types', () => {
    const fields = [
      mockField({
        key: 'tags',
        label: 'Tags',
        fieldType: FieldType.TAGS,
      }),
    ];

    expect(() => {
      validator.validate(fields, { tags: ['waterfall', 'nature'] });
    }).not.toThrow();

    expect(() => {
      validator.validate(fields, { tags: 'not-an-array' });
    }).toThrow(BadRequestException);
  });
});
