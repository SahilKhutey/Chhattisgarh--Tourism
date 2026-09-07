"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Locale, LanguageDefinition } from '../../lib/i18n/types';
import { SUPPORTED_LOCALES, normalizeLocale } from '../../lib/i18n/config';
import { translateText } from '../../lib/i18n/translator';
import { getGlossaryTranslation } from '../../lib/i18n/glossary';

interface TranslationContextProps {
  locale: 'en' | 'hi' | 'hne';
  setLocale: (next: Locale) => void;
  translate: (text: string) => Promise<string>;
  t: (keyOrText: string) => string;
  languages: LanguageDefinition[];
}

const TranslationContext = createContext<TranslationContextProps | undefined>(undefined);

export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<'en' | 'hi' | 'hne'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('preferred_language') || localStorage.getItem('cg_lang');
      if (saved) {
        return normalizeLocale(saved);
      }
    }
    return 'en';
  });

  const setLocale = useCallback((next: Locale) => {
    const norm = normalizeLocale(next);
    setLocaleState(norm);
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferred_language', norm);
      localStorage.setItem('cg_lang', norm);
    }
  }, []);

  const translate = useCallback(
    async (text: string): Promise<string> => {
      const res = await translateText({ text, target: locale });
      return res.translatedText;
    },
    [locale],
  );

  const t = useCallback(
    (keyOrText: string): string => {
      if (locale === 'en') return keyOrText;
      const glossary = getGlossaryTranslation(keyOrText, locale);
      return glossary || keyOrText;
    },
    [locale],
  );

  return (
    <TranslationContext.Provider
      value={{
        locale,
        setLocale,
        translate,
        t,
        languages: SUPPORTED_LOCALES,
      }}
    >
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const ctx = useContext(TranslationContext);
  if (!ctx) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return ctx;
};
