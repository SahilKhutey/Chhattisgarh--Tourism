import { LanguageDefinition, Locale } from './types';

export const DEFAULT_LOCALE: 'en' | 'hi' | 'hne' = 'en';

export const SUPPORTED_LOCALES: LanguageDefinition[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    speechLocale: 'en-IN',
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    speechLocale: 'hi-IN',
  },
  {
    code: 'hne',
    name: 'Chhattisgarhi',
    nativeName: 'छत्तीसगढ़ी',
    speechLocale: 'hi-IN',
  },
];

export function isLocale(val: unknown): val is Locale {
  return typeof val === 'string' && ['en', 'hi', 'hne', 'cg'].includes(val.toLowerCase());
}

export function normalizeLocale(val: string): 'en' | 'hi' | 'hne' {
  const lower = (val || '').toLowerCase();
  if (lower === 'cg' || lower === 'hne') return 'hne';
  if (lower === 'hi') return 'hi';
  return 'en';
}

export function getLanguage(code: string): LanguageDefinition {
  const norm = normalizeLocale(code);
  return SUPPORTED_LOCALES.find((l) => l.code === norm) ?? SUPPORTED_LOCALES[0];
}
