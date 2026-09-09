export interface CustomFieldPlugin {
  name: string;
  fieldType: string;
  validate?: (value: unknown) => boolean;
}

export class FieldPluginRegistry {
  private plugins = new Map<string, CustomFieldPlugin>();

  register(plugin: CustomFieldPlugin): void {
    this.plugins.set(plugin.fieldType.toUpperCase(), plugin);
  }

  get(fieldType: string): CustomFieldPlugin | undefined {
    return this.plugins.get(fieldType.toUpperCase());
  }
}
