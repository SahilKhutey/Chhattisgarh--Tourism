"use client";

import React from "react";
import { useTranslate } from "../hooks/useTranslate";
import { useLanguage } from "../context/LanguageContext";

interface LiveTranslatedTextProps {
  /** The source text in English (or sourceLang) to be translated. */
  text: string;

  /** Source language code. Default: 'en'. */
  sourceLang?: string;

  /** Optional CSS class for the wrapping element. */
  className?: string;

  /** HTML element to render as. Default: 'span'. */
  as?: keyof React.JSX.IntrinsicElements;

  /** If true, shows a "LIVE" badge indicating real-time translation. */
  showBadge?: boolean;

  /** Whether to skip translation (for pre-translated / static content). */
  skip?: boolean;
}

/**
 * LiveTranslatedText
 * ------------------
 * Drop-in component that wraps dynamic user-generated text and live-translates
 * it via the Google Cloud Translation API through the NestJS backend.
 *
 * Ideal for:
 *   - User reviews & ratings
 *   - Community-submitted folklore descriptions
 *   - Dynamic blog posts and tourism updates
 *   - AI assistant responses
 *   - Comments and forum posts
 *
 * Features:
 *   - Shows a shimmer skeleton while loading.
 *   - Falls back to original English text on error.
 *   - Uses IndexedDB to cache translations offline.
 *   - Respects the global language from LanguageContext.
 *
 * Usage:
 *   <LiveTranslatedText text="This waterfall is magnificent!" className="text-sm" />
 */
export default function LiveTranslatedText({
  text,
  sourceLang = "en",
  className = "",
  as: Tag = "span",
  showBadge = false,
  skip = false,
}: LiveTranslatedTextProps) {
  const { lang } = useLanguage();
  const { translated, isLoading, fromCache, error } = useTranslate(
    text,
    sourceLang,
    skip || lang === "en",
  );

  // While translating, show an animated shimmer skeleton
  if (isLoading) {
    return (
      <span
        className={`inline-block animate-pulse bg-charcoal-stone/10 rounded-md text-transparent select-none ${className}`}
        aria-hidden="true"
      >
        {/* Invisible placeholder maintains layout space */}
        {text}
      </span>
    );
  }

  return (
    <Tag className={className} title={error ? `Translation unavailable: ${error}` : undefined}>
      {translated}
      {showBadge && lang !== "en" && !fromCache && !error && (
        <span
          className="inline-flex items-center gap-0.5 ml-1.5 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-blue-100 text-blue-700 border border-blue-200 align-middle"
          title="Translated in real-time by Google Cloud Translation"
        >
          🌐 LIVE
        </span>
      )}
    </Tag>
  );
}
