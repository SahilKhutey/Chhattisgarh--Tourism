import { FieldType } from '../src/schema/types';
import { createTemplateSchemaSnapshot } from '../src/schema/serializer';
import { validateTemplateEntry } from '../src/validation/validator';
import { FieldTypeRegistry } from '../src/field-types/registry';
import { FieldTypeDefinition } from '../src/field-types/contract';
import { createInvalidResult, createValidResult } from '../src/validation/errors';

describe('validateTemplateEntry (Draft vs. Strict Validation)', () => {
  let registry: FieldTypeRegistry;

  const textHandler: FieldTypeDefinition<{ minLength?: number }, string> = {
    type: FieldType.TEXT,
    validateOptions: () => createValidResult(),
    validateValue: (val, options) => {
      if (typeof val !== 'string') {
        return createInvalidResult([
          { fieldKey: '', code: 'INVALID_TYPE', message: 'Value must be a string.' },
        ]);
      }
      if (options?.minLength && val.length < options.minLength) {
        return createInvalidResult([
          {
            fieldKey: '',
            code: 'MIN_LENGTH_NOT_MET',
            message: `Minimum length is ${options.minLength}.`,
          },
        ]);
      }
      return createValidResult();
    },
    serialize: (v) => v,
    deserialize: (v) => String(v),
    getDefaultValue: () => '',
    getEditorMetadata: () => ({ component: 'TextEditor' }),
    getDisplayMetadata: () => ({ component: 'TextDisplay' }),
  };

  const schema = createTemplateSchemaSnapshot({
    templateSlug: 'heritage_site',
    templateName: 'Heritage Site',
    version: 1,
    fields: [
      {
        key: 'monumentName',
        label: 'Monument Name',
        fieldType: FieldType.TEXT,
        required: true,
        order: 1,
        translatable: true,
        options: { minLength: 3 },
      },
      {
        key: 'synopsis',
        label: 'Historical Synopsis',
        fieldType: FieldType.TEXT,
        required: false,
        order: 2,
        translatable: true,
      },
    ],
  });

  beforeEach(() => {
    registry = new FieldTypeRegistry();
    registry.register(textHandler);
  });

  it('should pass in DRAFT mode even if required fields are missing', () => {
    const draftData = { synopsis: 'Ancient temple complex from 7th century.' };
    const result = validateTemplateEntry(draftData, schema, {
      mode: 'DRAFT',
      registry,
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should fail in STRICT mode if a required field is missing', () => {
    const incompleteData = { synopsis: 'Sirpur Buddhist Vihara.' };
    const result = validateTemplateEntry(incompleteData, schema, {
      mode: 'STRICT',
      registry,
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].code).toBe('REQUIRED_FIELD_MISSING');
    expect(result.errors[0].fieldKey).toBe('monumentName');
  });

  it('should fail if provided field value violates field handler validation', () => {
    const invalidData = {
      monumentName: 'X', // shorter than minLength 3
      synopsis: 'Description',
    };

    const result = validateTemplateEntry(invalidData, schema, {
      mode: 'STRICT',
      registry,
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].code).toBe('MIN_LENGTH_NOT_MET');
    expect(result.errors[0].fieldKey).toBe('monumentName');
  });

  it('should pass in STRICT mode when all requirements and constraints are satisfied', () => {
    const validData = {
      monumentName: 'Bhoramdeo Temple',
      synopsis: 'Nagavanshi architecture in Kawardha.',
    };

    const result = validateTemplateEntry(validData, schema, {
      mode: 'STRICT',
      registry,
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});
