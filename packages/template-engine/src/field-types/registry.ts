/**
 * @cg-tourism/template-engine - Field Type Registry
 * Central, extensible registry for all field types supported by the CG Tourism Content Engine.
 */

import { FieldType } from '../schema/types';
import { FieldTypeDefinition } from './contract';

export class FieldTypeRegistry {
  private readonly definitions = new Map<FieldType, FieldTypeDefinition>();

  /**
   * Registers a new FieldType definition.
   */
  public register(definition: FieldTypeDefinition): this {
    if (!definition || !definition.type) {
      throw new Error('Invalid FieldTypeDefinition: missing field type.');
    }

    if (this.definitions.has(definition.type)) {
      throw new Error(
        `FieldType "${definition.type}" is already registered. Cannot register duplicate handler.`,
      );
    }

    this.definitions.set(definition.type, definition);
    return this;
  }

  /**
   * Retrieves a FieldTypeDefinition by its FieldType.
   */
  public get<TOptions = unknown, TValue = unknown>(
    type: FieldType,
  ): FieldTypeDefinition<TOptions, TValue> | undefined {
    return this.definitions.get(type) as FieldTypeDefinition<TOptions, TValue> | undefined;
  }

  /**
   * Retrieves a FieldTypeDefinition or throws an error if unregistered.
   */
  public getOrThrow<TOptions = unknown, TValue = unknown>(
    type: FieldType,
  ): FieldTypeDefinition<TOptions, TValue> {
    const def = this.get<TOptions, TValue>(type);
    if (!def) {
      throw new Error(`FieldType "${type}" is not registered in FieldTypeRegistry.`);
    }
    return def;
  }

  /**
   * Checks if a field type is currently registered.
   */
  public has(type: FieldType): boolean {
    return this.definitions.has(type);
  }

  /**
   * Returns all registered FieldType definitions.
   */
  public getAll(): FieldTypeDefinition[] {
    return Array.from(this.definitions.values());
  }

  /**
   * Returns list of all registered FieldTypes.
   */
  public listSupportedTypes(): FieldType[] {
    return Array.from(this.definitions.keys());
  }

  /**
   * Clears the registry (primarily used in test environments).
   */
  public clear(): void {
    this.definitions.clear();
  }
}

export const fieldTypeRegistry = new FieldTypeRegistry();
