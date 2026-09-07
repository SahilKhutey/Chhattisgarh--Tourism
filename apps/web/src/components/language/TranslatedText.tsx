"use client";

import React, { useEffect, useState } from 'react';
import { useTranslation } from './TranslationProvider';

interface TranslatedTextProps {
  text: string;
  fallback?: string;
  className?: string;
}

export const TranslatedText: React.FC<TranslatedTextProps> = ({
  text,
  fallback,
  className = '',
}) => {
  const { locale, translate, t } = useTranslation();
  const [asyncText, setAsyncText] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (locale === 'en') {
      return;
    }

    translate(text).then((res) => {
      if (isMounted && res) {
        setAsyncText(res);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [text, locale, translate]);

  const displayedText = locale === 'en' ? text : (asyncText ?? t(text) ?? fallback ?? text);

  return <span className={className}>{displayedText}</span>;
};
