import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class TranslationService {
  private readonly logger = new Logger(TranslationService.name);
  private glossary: any = null;

  constructor(private readonly prisma: PrismaService) {
    this.loadGlossary();
  }

  private loadGlossary() {
    try {
      const glossaryPath = path.join(__dirname, 'data', 'glossary.json');
      // If run in ts-node or compiled dist, handle path differences
      const resolvedPath = fs.existsSync(glossaryPath) 
        ? glossaryPath 
        : path.join(process.cwd(), 'src/modules/translation/data/glossary.json');

      if (fs.existsSync(resolvedPath)) {
        const fileContent = fs.readFileSync(resolvedPath, 'utf8');
        this.glossary = JSON.parse(fileContent);
        this.logger.log('Tourism glossary loaded successfully.');
      } else {
        this.logger.warn(`Glossary file not found at: ${resolvedPath}`);
      }
    } catch (error) {
      this.logger.error('Failed to load tourism glossary:', error);
    }
  }

  /**
   * Fetch all database translations for a given language.
   * Formats output as: { [entityId]: { [field]: value } }
   * For Places, keys translations by their slug to align with the client-side identifiers.
   */
  async getTranslations(lang: string, entityType?: string) {
    const where: any = { lang };
    if (entityType) {
      where.entityType = entityType;
    }

    const translations = await this.prisma.translation.findMany({ where });
    
    // Query places to map their UUIDs to slugs
    const places = await this.prisma.place.findMany({
      select: { id: true, slug: true },
    });
    const placeIdToSlug = new Map<string, string>(
      places.map((p) => [p.id, p.slug])
    );

    const formatted: Record<string, Record<string, string>> = {};

    for (const t of translations) {
      let key = t.entityId;
      if (t.entityType === 'Place') {
        const slug = placeIdToSlug.get(t.entityId);
        if (slug) {
          key = slug;
        }
      }

      if (!formatted[key]) {
        formatted[key] = {};
      }
      formatted[key][t.field] = t.value;
    }

    return formatted;
  }

  /**
   * Validate a translation string against the glossary definitions.
   * Returns a suggestions array and validation status.
   */
  validateTranslation(text: string, lang: string): { isValid: boolean; warning?: string; suggestions: string[] } {
    if (!this.glossary) {
      return { isValid: true, suggestions: [] };
    }

    const lowercaseText = text.toLowerCase();
    const suggestions: string[] = [];
    let warning = '';
    let isValid = true;

    for (const [key, langMap] of Object.entries(this.glossary)) {
      const targetTerm = (langMap as any)[lang];
      // If text contains the English keyword, verify the translation uses the correct regional word
      if (lowercaseText.includes(key) && targetTerm) {
        if (!text.includes(targetTerm)) {
          isValid = false;
          warning = `Translation may lack correct regional term for '${key}'. Expected '${targetTerm}'.`;
          suggestions.push(targetTerm);
        }
      }
    }

    return { isValid, warning, suggestions };
  }

  /**
   * Insert or update a translation record.
   */
  async upsertTranslation(lang: string, entityType: string, entityId: string, field: string, value: string) {
    return this.prisma.translation.upsert({
      where: {
        lang_entityType_entityId_field: {
          lang,
          entityType,
          entityId,
          field,
        },
      },
      update: { value },
      create: {
        lang,
        entityType,
        entityId,
        field,
        value,
      },
    });
  }
}
