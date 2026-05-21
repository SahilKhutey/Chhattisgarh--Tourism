export type Language = "en" | "hi" | "cg";

/**
 * Detects the language based on local storage, or falls back to browser settings,
 * and defaults to 'en' if neither are present or matched.
 */
export const detectLanguage = (): Language => {
  if (typeof window === 'undefined') return 'en';

  const savedLang = localStorage.getItem('cg_lang');
  if (savedLang === 'en' || savedLang === 'hi' || savedLang === 'cg') {
    return savedLang;
  }

  const browserLang = navigator.language;
  if (browserLang.startsWith('hi')) {
    return 'hi';
  }

  return 'en';
};
