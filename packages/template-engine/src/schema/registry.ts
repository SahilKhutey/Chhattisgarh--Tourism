import type {
  FieldType
} from "./types.js";

import {
  FIELD_TYPE_DEFINITIONS,
  type FieldTypeDefinition
} from "./field-types.js";

export class FieldTypeRegistry {
  private readonly definitions =
    new Map<FieldType, FieldTypeDefinition>();

  constructor() {
    for (const definition of Object.values(
      FIELD_TYPE_DEFINITIONS
    )) {
      this.register(definition);
    }
  }

  register(
    definition: FieldTypeDefinition
  ): void {
    if (this.definitions.has(definition.type)) {
      throw new Error(
        `Field type already registered: ${definition.type}`
      );
    }

    this.definitions.set(
      definition.type,
      definition
    );
  }

  has(type: string): boolean {
    return this.definitions.has(type as FieldType);
  }

  get(
    type: FieldType
  ): FieldTypeDefinition {
    const definition =
      this.definitions.get(type);

    if (!definition) {
      throw new Error(
        `Field type is not registered: ${type}`
      );
    }

    return definition;
  }

  list(): FieldTypeDefinition[] {
    return [...this.definitions.values()];
  }

  listTypes(): FieldType[] {
    return [...this.definitions.keys()];
  }
}

export const fieldTypeRegistry =
  new FieldTypeRegistry();
