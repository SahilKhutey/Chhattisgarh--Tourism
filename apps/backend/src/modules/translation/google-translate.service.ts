import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * GoogleTranslateService
 * ---------------------
 * Encapsulates all calls to the Google Cloud Translation API v2.
 * Provides graceful fallback to the original text when the API key
 * is absent or the request fails, ensuring zero hard dependency at runtime.
 *
 * Language mapping:
 *   en  → 'en'
 *   hi  → 'hi'
 *   cg  → 'hi'  (Chhattisgarhi is routed through Hindi; glossary engine
 *                 applies cultural replacements as a post-processing step)
 */
@Injectable()
export class GoogleTranslateService {
  private readonly logger = new Logger(GoogleTranslateService.name);
  private translateClient: any = null;
  private readonly languageMap: Record<string, string> = {
    en: 'en',
    hi: 'hi',
    cg: 'hi', // Route Chhattisgarhi through Hindi; glossary engine handles dialect
  };

  constructor(private readonly config: ConfigService) {
    this.initClient();
  }

  /**
   * Lazily initialise the Google Cloud Translate v2 client.
   * Falls back gracefully if the API key env var is not set.
   */
  private async initClient() {
    const apiKey = this.config.get<string>('GOOGLE_TRANSLATE_API_KEY');
    if (!apiKey || apiKey === 'your_key_here') {
      this.logger.warn(
        'GOOGLE_TRANSLATE_API_KEY is not configured. Live translation will return source text.',
      );
      return;
    }
    try {
      // Dynamically import to avoid crashing the module if the package
      // is not installed yet during development bootstrapping.
      const { Translate } = await import(
        '@google-cloud/translate/build/src/v2'
      );
      this.translateClient = new Translate({ key: apiKey });
      this.logger.log('Google Cloud Translate client initialised.');
    } catch (err) {
      this.logger.error(
        'Failed to load @google-cloud/translate. Is it installed?',
        err,
      );
    }
  }

  /**
   * Translate a single text string.
   * @param text        The source text in English (or sourceLang).
   * @param targetLang  The platform language code ('en', 'hi', 'cg').
   * @returns           Translated string, or original text on failure.
   */
  async translateText(text: string, targetLang: string): Promise<string> {
    if (!text || text.trim() === '') return text;

    // English → no translation required
    if (targetLang === 'en') return text;

    // Resolve Google language code
    const googleLang = this.languageMap[targetLang] ?? targetLang;

    if (!this.translateClient) {
      this.logger.debug(
        'No translate client available; returning original text.',
      );
      return text;
    }

    try {
      const [translation] = await this.translateClient.translate(
        text,
        googleLang,
      );
      return translation as string;
    } catch (err: any) {
      this.logger.error(
        `Translation failed for lang="${targetLang}": ${err?.message ?? err}`,
      );
      return text; // Graceful fallback
    }
  }

  /**
   * Translate an array of strings in a single batched API call.
   * More cost-efficient than calling translateText() in a loop.
   */
  async batchTranslate(
    texts: string[],
    targetLang: string,
  ): Promise<string[]> {
    if (!texts.length) return texts;
    if (targetLang === 'en') return texts;

    const googleLang = this.languageMap[targetLang] ?? targetLang;

    if (!this.translateClient) {
      return texts; // Graceful fallback
    }

    try {
      const [translations] = await this.translateClient.translate(
        texts,
        googleLang,
      );
      return translations as string[];
    } catch (err: any) {
      this.logger.error(
        `Batch translation failed for lang="${targetLang}": ${err?.message ?? err}`,
      );
      return texts;
    }
  }

  /**
   * Whether the Google Translate client is available and ready.
   */
  isAvailable(): boolean {
    return this.translateClient !== null;
  }
}
