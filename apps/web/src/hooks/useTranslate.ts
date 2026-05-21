"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useLanguage } from "../context/LanguageContext";
import { getCache, setCache } from "./useIndexedDBCache";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

interface UseTranslateResult {
  /** The translated text. Falls back to `text` on error or while loading. */
  translated: string;
  /** True while waiting for the API response. */
  isLoading: boolean;
  /** Whether the result came from cache (IndexedDB or server). */
  fromCache: boolean;
  /** Error message if translation failed. */
  error: string | null;
}

/**
 * useTranslate
 * ------------
 * React hook for live-translating a single text string via the
 * NestJS `/translations/live` endpoint (backed by Google Cloud Translate).
 *
 * Features:
 *  - Respects the current platform language from `LanguageContext`.
 *  - L1 cache: IndexedDB (browser-persistent, offline-resilient).
 *  - Falls back to the original `text` on error or when API is unavailable.
 *  - Skips API call when `lang === 'en'` or `lang === sourceLang`.
 *
 * Usage:
 *   const { translated, isLoading } = useTranslate("User submitted review text");
 *
 * @param text        The source text to translate (usually English).
 * @param sourceLang  The source language of `text`. Default: 'en'.
 * @param skip        If true, returns original text without translation (for
 *                    static content that already has i18n).
 */
export function useTranslate(
  text: string,
  sourceLang: string = "en",
  skip: boolean = false,
): UseTranslateResult {
  const { lang } = useLanguage();
  const [translated, setTranslated] = useState<string>(text);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fromCache, setFromCache] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Abort controller ref to cancel in-flight requests when deps change
  const abortRef = useRef<AbortController | null>(null);

  const translate = useCallback(async () => {
    // No translation needed for English or if same language
    if (!text || skip || lang === "en" || lang === sourceLang) {
      setTranslated(text);
      setIsLoading(false);
      return;
    }

    const cacheKey = `${sourceLang}:${lang}:${text}`;

    // ── Check IndexedDB cache first ──────────────────────────
    const cached = await getCache(cacheKey);
    if (cached) {
      setTranslated(cached);
      setFromCache(true);
      setIsLoading(false);
      return;
    }

    // ── Call backend live translation API ────────────────────
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/translations/live`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          sourceLang,
          targetLang: lang,
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) throw new Error(`Translation API error: ${res.status}`);

      const data = await res.json();
      const result = data.translated as string;

      setTranslated(result);
      setFromCache(!!data.cached);

      // Save to IndexedDB for future offline use
      await setCache(cacheKey, result);
    } catch (err: any) {
      if (err?.name === "AbortError") return; // Cancelled — do nothing
      console.warn("[useTranslate] Translation failed, using original text:", err?.message);
      setError(err?.message ?? "Translation failed");
      setTranslated(text); // Graceful fallback
    } finally {
      setIsLoading(false);
    }
  }, [text, lang, sourceLang, skip]);

  useEffect(() => {
    translate();
    return () => {
      abortRef.current?.abort();
    };
  }, [translate]);

  return { translated, isLoading, fromCache, error };
}

/**
 * useBatchTranslate
 * -----------------
 * Translates an array of strings in a single API call.
 * More efficient than calling useTranslate() for each item in a list.
 *
 * Usage:
 *   const { translations, isLoading } = useBatchTranslate(reviewTexts);
 */
export function useBatchTranslate(
  texts: string[],
  sourceLang: string = "en",
): { translations: string[]; isLoading: boolean; error: string | null } {
  const { lang } = useLanguage();
  const [translations, setTranslations] = useState<string[]>(texts);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!texts.length || lang === "en") {
      setTranslations(texts);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    fetch(`${API_BASE}/translations/batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texts, sourceLang, targetLang: lang }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          setTranslations(data.translations ?? texts);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.warn("[useBatchTranslate] Error:", err?.message);
          setError(err?.message ?? "Batch translation failed");
          setTranslations(texts); // Graceful fallback
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [JSON.stringify(texts), lang, sourceLang]);

  return { translations, isLoading, error };
}
