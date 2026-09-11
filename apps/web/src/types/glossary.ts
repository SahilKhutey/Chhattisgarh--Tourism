export interface GlossaryTranslation {
  locale_code: string;
  term: string;
  synonyms: string[];
}

export interface GlossaryTerm {
  id: number;
  key: string;
  definition: string | null;
  context: string | null;
  preferred: boolean;
  deprecated: boolean;
  translations: GlossaryTranslation[];
}
