import { TranslationRequest, TranslationResponse } from './types';
import { normalizeLocale } from './config';
import { getGlossaryTranslation } from './glossary';
import { getCachedTranslation, setCachedTranslation } from './cache';
import { getApiBase } from '../../app/data/api-config';

/**
 * Universal client-side translation orchestrator:
 * Cache -> Local Glossary -> Remote API (/api/v1/translation) -> Graceful Fallback
 * Never throws an error or blocks the user interface.
 */
export async function translateText(
  request: TranslationRequest,
): Promise<TranslationResponse> {
  const source = normalizeLocale(request.source || 'en');
  const target = normalizeLocale(request.target);
  const text = (request.text || '').trim();

  // 1. Passthrough on identical source/target or empty string
  if (!text || source === target) {
    return {
      text,
      source,
      target,
      translatedText: text,
      provider: 'passthrough',
      cached: false,
    };
  }

  // 2. Client Cache Hit (Memory / localStorage)
  const cached = getCachedTranslation(text, source, target);
  if (cached) {
    return {
      text,
      source,
      target,
      translatedText: cached,
      provider: 'memory',
      cached: true,
    };
  }

  // 3. Local Regional Glossary Match
  const glossaryMatch = getGlossaryTranslation(text, target);
  if (glossaryMatch) {
    setCachedTranslation(text, source, target, glossaryMatch);
    return {
      text,
      source,
      target,
      translatedText: glossaryMatch,
      provider: 'glossary',
      cached: false,
    };
  }

  // 4. Remote API Call to Backend
  try {
    const apiBase = getApiBase();
    const res = await fetch(`${apiBase}/translation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        source,
        target,
      }),
    });

    if (res.ok) {
      const data: TranslationResponse = await res.json();
      if (data && data.translatedText) {
        setCachedTranslation(text, source, target, data.translatedText);
        return data;
      }
    }
  } catch (err) {
    // Network error or backend offline; proceed to fallback
    console.warn('Translation API network request failed, falling back to local fallback:', err);
  }

  // 5. Fallback: If glossary has any word, return it, otherwise return original text
  const fallbackText = getGlossaryTranslation(text, target) || text;
  return {
    text,
    source,
    target,
    translatedText: fallbackText,
    provider: fallbackText !== text ? 'glossary' : 'fallback',
    cached: false,
  };
}
