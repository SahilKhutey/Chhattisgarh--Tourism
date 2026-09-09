export interface VoiceFieldBinding {
  fieldKey: string;
  getValue(): string;
  setValue(value: string): void;
  language: string;
}

export function isVoiceCompatibleField(fieldType: string): boolean {
  return ['TEXT', 'TEXTAREA', 'RICHTEXT'].includes(fieldType.toUpperCase());
}
