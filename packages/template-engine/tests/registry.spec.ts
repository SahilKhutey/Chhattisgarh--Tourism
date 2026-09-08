import { FieldType } from '../src/schema/types';
import { FieldTypeRegistry } from '../src/field-types/registry';
import { FieldTypeDefinition } from '../src/field-types/contract';
import { createValidResult } from '../src/validation/errors';

describe('FieldTypeRegistry', () => {
  let registry: FieldTypeRegistry;

  beforeEach(() => {
    registry = new FieldTypeRegistry();
  });

  const createMockDefinition = (type: FieldType): FieldTypeDefinition => ({
    type,
    validateOptions: () => createValidResult(),
    validateValue: () => createValidResult(),
    serialize: (v) => v,
    deserialize: (v) => v,
    getDefaultValue: () => null,
    getEditorMetadata: () => ({ component: `${type}Editor` }),
    getDisplayMetadata: () => ({ component: `${type}Display` }),
  });

  it('should register and retrieve a field type definition', () => {
    const textDef = createMockDefinition(FieldType.TEXT);
    registry.register(textDef);

    expect(registry.has(FieldType.TEXT)).toBe(true);
    expect(registry.get(FieldType.TEXT)).toBe(textDef);
    expect(registry.getOrThrow(FieldType.TEXT)).toBe(textDef);
  });

  it('should prevent duplicate registration of the same field type', () => {
    const textDef = createMockDefinition(FieldType.TEXT);
    registry.register(textDef);

    expect(() => registry.register(textDef)).toThrow(
      'FieldType "TEXT" is already registered.',
    );
  });

  it('should throw an error when getting an unregistered field type via getOrThrow', () => {
    expect(() => registry.getOrThrow(FieldType.GEO_POINT)).toThrow(
      'FieldType "GEO_POINT" is not registered',
    );
  });

  it('should list all registered field types', () => {
    registry.register(createMockDefinition(FieldType.TEXT));
    registry.register(createMockDefinition(FieldType.GEO_POINT));
    registry.register(createMockDefinition(FieldType.RELATION));

    const types = registry.listSupportedTypes();
    expect(types).toEqual([FieldType.TEXT, FieldType.GEO_POINT, FieldType.RELATION]);
    expect(registry.getAll().length).toBe(3);
  });

  it('should clear registry on command', () => {
    registry.register(createMockDefinition(FieldType.TEXT));
    expect(registry.has(FieldType.TEXT)).toBe(true);

    registry.clear();
    expect(registry.has(FieldType.TEXT)).toBe(false);
    expect(registry.getAll()).toHaveLength(0);
  });
});
