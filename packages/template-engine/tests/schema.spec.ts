import { FieldType } from '../src/schema/types';
import {
  createTemplateSchemaSnapshot,
  deserializeTemplateSchema,
  serializeTemplateSchema,
} from '../src/schema/serializer';

describe('TemplateSchema Snapshot & Serialization', () => {
  const validFields = [
    {
      key: 'title',
      label: 'Destination Title',
      fieldType: FieldType.TEXT,
      required: true,
      order: 1,
      translatable: true,
    },
    {
      key: 'location',
      label: 'Coordinates',
      fieldType: FieldType.GEO_POINT,
      required: true,
      order: 3,
      translatable: false,
    },
    {
      key: 'description',
      label: 'Story and Narrative',
      fieldType: FieldType.RICHTEXT,
      required: false,
      order: 2,
      translatable: true,
    },
  ];

  it('should create an immutable normalized schema snapshot with sorted fields', () => {
    const snapshot = createTemplateSchemaSnapshot({
      templateSlug: 'destination',
      templateName: 'Tourism Destination',
      version: 1,
      description: 'Ancient temples, waterfalls, and cultural hotspots',
      fields: validFields,
    });

    expect(snapshot.templateSlug).toBe('destination');
    expect(snapshot.version).toBe(1);
    expect(snapshot.fields).toHaveLength(3);

    // Verify fields are sorted deterministically by order
    expect(snapshot.fields[0].key).toBe('title');
    expect(snapshot.fields[1].key).toBe('description');
    expect(snapshot.fields[2].key).toBe('location');

    // Immutability test: Object.isFrozen
    expect(Object.isFrozen(snapshot)).toBe(true);
  });

  it('should reject schema with duplicate field keys', () => {
    expect(() =>
      createTemplateSchemaSnapshot({
        templateSlug: 'festival',
        templateName: 'Tribal Festival',
        version: 1,
        fields: [
          {
            key: 'title',
            label: 'Title 1',
            fieldType: FieldType.TEXT,
            required: true,
            order: 1,
            translatable: true,
          },
          {
            key: 'title',
            label: 'Title Duplicate',
            fieldType: FieldType.TEXT,
            required: false,
            order: 2,
            translatable: true,
          },
        ],
      }),
    ).toThrow('Duplicate field key "title" detected');
  });

  it('should round-trip serialize and deserialize accurately', () => {
    const original = createTemplateSchemaSnapshot({
      templateSlug: 'waterfall',
      templateName: 'Chitrakote Horseshoe Falls',
      version: 2,
      fields: validFields,
    });

    const serialized = serializeTemplateSchema(original);
    const deserialized = deserializeTemplateSchema(serialized);

    expect(deserialized.templateSlug).toBe(original.templateSlug);
    expect(deserialized.version).toBe(original.version);
    expect(deserialized.fields.length).toBe(original.fields.length);
    expect(deserialized.fields[0].key).toBe(original.fields[0].key);
  });
});
