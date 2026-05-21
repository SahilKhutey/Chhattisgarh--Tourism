import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { GoogleTranslateService } from './google-translate.service';
import { GlossaryService, GlossaryEntry } from './glossary.service';

/**
 * TranslationService
 * ------------------
 * Central orchestrator for all translation operations.
 *
 * Responsibilities:
 *  1. Serve static DB translations (Prisma Translation model) by lang.
 *  2. Live-translate dynamic user content via Google Translate.
 *  3. Apply Chhattisgarhi glossary post-processing for cultural accuracy.
 *  4. Cache live API results in SQLite (TranslationCache) to reduce cost.
 *  5. In-memory LRU Map as L1 cache layer above SQLite.
 */
@Injectable()
export class TranslationService {
  private readonly logger = new Logger(TranslationService.name);

  /** L1 In-memory cache: `${sourceLang}:${targetLang}:${text}` → translated */
  private readonly memCache = new Map<string, string>();
  private readonly MAX_MEM_CACHE = 500;

  constructor(
    private readonly prisma: PrismaService,
    private readonly googleTranslate: GoogleTranslateService,
    private readonly glossary: GlossaryService,
  ) {}

  // ─────────────────────────────────────────────────────────────
  // STATIC DB TRANSLATIONS
  // ─────────────────────────────────────────────────────────────

  /**
   * Fetch all database translations for a given language.
   * Formats output as: { [entityId / slug]: { [field]: value } }
   */
  async getTranslations(lang: string, entityType?: string) {
    const where: any = { lang };
    if (entityType) {
      where.entityType = entityType;
    }

    const translations = await this.prisma.translation.findMany({ where });

    // Map Place UUIDs → slugs so client can use slug-based keys
    const places = await this.prisma.place.findMany({
      select: { id: true, slug: true },
    });
    const placeIdToSlug = new Map<string, string>(
      places.map((p) => [p.id, p.slug]),
    );

    const formatted: Record<string, Record<string, string>> = {};

    for (const t of translations) {
      let key = t.entityId;
      if (t.entityType === 'Place') {
        const slug = placeIdToSlug.get(t.entityId);
        if (slug) key = slug;
      }

      if (!formatted[key]) formatted[key] = {};
      formatted[key][t.field] = t.value;
    }

    return formatted;
  }

  /**
   * Insert or update a static translation record.
   */
  async upsertTranslation(
    lang: string,
    entityType: string,
    entityId: string,
    field: string,
    value: string,
  ) {
    return this.prisma.translation.upsert({
      where: {
        lang_entityType_entityId_field: { lang, entityType, entityId, field },
      },
      update: { value },
      create: { lang, entityType, entityId, field, value },
    });
  }

  // ─────────────────────────────────────────────────────────────
  // LIVE TRANSLATION — Google Translate + Glossary Engine
  // ─────────────────────────────────────────────────────────────

  /**
   * Translate dynamic user content using Google Cloud Translation.
   * Pipeline: Google Translate → Chhattisgarhi Glossary → SQLite Cache
   *
   * @param text        Source text (any language, usually 'en').
   * @param targetLang  Platform language code: 'en', 'hi', 'cg'.
   * @param sourceLang  Source language code (default: 'en').
   * @returns           Translated text + cache metadata.
   */
  async translateLive(
    text: string,
    targetLang: string,
    sourceLang: string = 'en',
  ): Promise<{ translated: string; cached: boolean; provider: string }> {
    if (!text?.trim()) return { translated: text, cached: false, provider: 'passthrough' };
    if (targetLang === 'en' || targetLang === sourceLang) {
      return { translated: text, cached: false, provider: 'passthrough' };
    }

    const cacheKey = `${sourceLang}:${targetLang}:${text}`;

    // ── L1: In-memory cache ──────────────────────────────────
    if (this.memCache.has(cacheKey)) {
      return {
        translated: this.memCache.get(cacheKey)!,
        cached: true,
        provider: 'memory',
      };
    }

    // ── L2: SQLite persistent cache ──────────────────────────
    try {
      const dbCache = await (this.prisma as any).translationCache?.findUnique({
        where: { sourceText_sourceLang_targetLang: { sourceText: text, sourceLang, targetLang } },
      });
      if (dbCache) {
        this.setMemCache(cacheKey, dbCache.translated);
        return { translated: dbCache.translated, cached: true, provider: 'sqlite' };
      }
    } catch {
      // translationCache model may not exist in older schemas; skip gracefully
    }

    // ── L3: Google Cloud Translation API ──────────────────────
    let translated = await this.googleTranslate.translateText(text, targetLang);

    // ── L4: Chhattisgarhi Glossary Post-Processing ────────────
    // For 'cg': Google translates to Hindi, then glossary replaces
    // Hindi standard terms with culturally accurate Chhattisgarhi dialect words.
    if (targetLang === 'cg') {
      translated = this.glossary.applyGlossary(translated, 'cg');
    }

    // ── Save to caches ─────────────────────────────────────────
    this.setMemCache(cacheKey, translated);
    try {
      await (this.prisma as any).translationCache?.upsert({
        where: { sourceText_sourceLang_targetLang: { sourceText: text, sourceLang, targetLang } },
        update: { translated },
        create: { sourceText: text, sourceLang, targetLang, translated, apiProvider: 'google' },
      });
    } catch {
      // Graceful skip if cache model unavailable
    }

    return {
      translated,
      cached: false,
      provider: this.googleTranslate.isAvailable() ? 'google' : 'fallback',
    };
  }

  /**
   * Batch translate multiple texts in a single Google API call.
   * Applies glossary post-processing for 'cg' target.
   */
  async batchTranslateLive(
    texts: string[],
    targetLang: string,
    sourceLang: string = 'en',
  ): Promise<{ translations: string[]; provider: string }> {
    if (!texts.length || targetLang === 'en') {
      return { translations: texts, provider: 'passthrough' };
    }

    // Check in-memory cache for each text
    const results: string[] = new Array(texts.length);
    const uncachedIndices: number[] = [];
    const uncachedTexts: string[] = [];

    for (let i = 0; i < texts.length; i++) {
      const key = `${sourceLang}:${targetLang}:${texts[i]}`;
      if (this.memCache.has(key)) {
        results[i] = this.memCache.get(key)!;
      } else {
        uncachedIndices.push(i);
        uncachedTexts.push(texts[i]);
      }
    }

    if (uncachedTexts.length > 0) {
      const translated = await this.googleTranslate.batchTranslate(
        uncachedTexts,
        targetLang,
      );
      for (let j = 0; j < uncachedIndices.length; j++) {
        let result = translated[j] ?? uncachedTexts[j];
        if (targetLang === 'cg') {
          result = this.glossary.applyGlossary(result, 'cg');
        }
        results[uncachedIndices[j]] = result;
        const key = `${sourceLang}:${targetLang}:${uncachedTexts[j]}`;
        this.setMemCache(key, result);
      }
    }

    return {
      translations: results,
      provider: this.googleTranslate.isAvailable() ? 'google' : 'fallback',
    };
  }

  // ─────────────────────────────────────────────────────────────
  // GLOSSARY / VALIDATION (delegated to GlossaryService)
  // ─────────────────────────────────────────────────────────────

  validateTranslation(
    text: string,
    lang: string,
  ): { isValid: boolean; warning?: string; suggestions: string[] } {
    return this.glossary.validateAgainstGlossary(text, lang);
  }

  getGlossary(): Record<string, GlossaryEntry> {
    return this.glossary.getGlossary();
  }

  // ─────────────────────────────────────────────────────────────
  // INTERNAL HELPERS
  // ─────────────────────────────────────────────────────────────

  private setMemCache(key: string, value: string) {
    if (this.memCache.size >= this.MAX_MEM_CACHE) {
      // Evict the oldest entry (first inserted)
      const firstKey = this.memCache.keys().next().value;
      if (firstKey !== undefined) {
        this.memCache.delete(firstKey);
      }
    }
    this.memCache.set(key, value);
  }
}
