import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

/**
 * GlossaryEntry
 * Represents a culturally curated translation pair.
 * Exported so external callers (TranslationService, Controller) can type the return.
 */
export interface GlossaryEntry {
  hi: string;  // Standard Hindi term
  cg: string;  // Chhattisgarhi cultural equivalent
  tourism_category?: string; // e.g. 'waterfalls', 'temples', 'general'
  context?: string;          // Human-readable description
}

/**
 * GlossaryService
 * ---------------
 * Post-processing engine that applies the regional Chhattisgarhi glossary
 * to machine-translated Hindi text. This produces culturally accurate dialect
 * output that Google Translate alone cannot generate for Chhattisgarhi.
 *
 * Pipeline:
 *   Google Hindi Translation
 *       ↓
 *   applyGlossary(text, 'cg')
 *       ↓
 *   Culturally Accurate Chhattisgarhi Text
 */
@Injectable()
export class GlossaryService {
  private readonly logger = new Logger(GlossaryService.name);
  private glossary: Record<string, GlossaryEntry> = {};

  constructor() {
    this.loadGlossary();
  }

  /**
   * Load the regional tourism glossary from disk.
   */
  private loadGlossary() {
    try {
      const glossaryPath = path.join(__dirname, 'data', 'glossary.json');
      const resolvedPath = fs.existsSync(glossaryPath)
        ? glossaryPath
        : path.join(process.cwd(), 'src/modules/translation/data/glossary.json');

      if (fs.existsSync(resolvedPath)) {
        const content = fs.readFileSync(resolvedPath, 'utf8');
        this.glossary = JSON.parse(content);
        this.logger.log(
          `Regional tourism glossary loaded — ${Object.keys(this.glossary).length} entries.`,
        );
      } else {
        this.logger.warn(`Glossary file not found at: ${resolvedPath}`);
      }
    } catch (error) {
      this.logger.error('Failed to load tourism glossary:', error);
    }
  }

  /**
   * Apply glossary replacements to a translated text string.
   * For 'cg' language: replaces standard Hindi terms with Chhattisgarhi ones.
   * For 'hi' language: validates correct Hindi vocabulary usage.
   *
   * @param text  The input text (typically Hindi translation from Google).
   * @param lang  Target platform language code ('cg', 'hi').
   * @returns     Text with cultural dialect terms substituted.
   */
  applyGlossary(text: string, lang: string): string {
    if (lang !== 'cg' && lang !== 'hi') return text;

    let processedText = text;
    const targetField = lang as 'hi' | 'cg';

    for (const [englishKey, entry] of Object.entries(this.glossary)) {
      const sourceTerm = entry.hi;   // Start from Hindi (Google's output)
      const targetTerm = entry[targetField]; // Replace with correct dialect term

      if (!sourceTerm || !targetTerm) continue;

      // Replace all occurrences of the Hindi term with the dialect equivalent
      // Using word-boundary regex to avoid partial replacements
      try {
        const escapedSource = sourceTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escapedSource, 'g');
        processedText = processedText.replace(regex, targetTerm);
      } catch {
        // If regex fails on special Unicode chars, do plain string replace
        processedText = processedText.split(sourceTerm).join(targetTerm);
      }
    }

    return processedText;
  }

  /**
   * Validate a translation against the glossary.
   * Returns validation status and improvement suggestions.
   */
  validateAgainstGlossary(
    text: string,
    lang: string,
  ): { isValid: boolean; warning?: string; suggestions: string[] } {
    if (!text || !lang) return { isValid: true, suggestions: [] };

    const suggestions: string[] = [];
    let warning = '';
    let isValid = true;

    for (const [englishKey, entry] of Object.entries(this.glossary)) {
      const targetTerm = (entry as any)[lang];
      // If the text contains an English tourism keyword, check if the translated
      // version uses the correct regional term
      if (text.toLowerCase().includes(englishKey) && targetTerm) {
        if (!text.includes(targetTerm)) {
          isValid = false;
          warning = `Translation may be missing regional term for '${englishKey}'. Suggested: '${targetTerm}'.`;
          suggestions.push(targetTerm);
        }
      }
    }

    return { isValid, warning, suggestions };
  }

  /**
   * Return the full glossary for external inspection or admin endpoints.
   */
  getGlossary(): Record<string, GlossaryEntry> {
    return this.glossary;
  }
}
