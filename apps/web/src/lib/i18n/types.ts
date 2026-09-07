export type Locale = 'en' | 'hi' | 'hne' | 'cg';

export interface LanguageDefinition {
  code: 'en' | 'hi' | 'hne';
  name: string;
  nativeName: string;
  speechLocale: string;
}

export interface TranslationRequest {
  text: string;
  source?: Locale;
  target: Locale;
}

export interface TranslationResponse {
  text: string;
  source: string;
  target: string;
  translatedText: string;
  provider: 'memory' | 'sqlite' | 'glossary' | 'google' | 'original' | 'passthrough' | 'fallback';
  cached: boolean;
}
