import { Module } from '@nestjs/common';
import { TranslationController } from './translation.controller';
import { TranslationService } from './translation.service';
import { GoogleTranslateService } from './google-translate.service';
import { GlossaryService } from './glossary.service';
import { PrismaService } from '../../database/prisma.service';

/**
 * TranslationModule
 * -----------------
 * Provides the complete hybrid translation infrastructure:
 *  - Static DB-backed translations (Prisma Translation model)
 *  - Live Google Cloud Translation API integration
 *  - Chhattisgarhi Regional Glossary Engine (post-processing)
 *  - SQLite + In-Memory translation caching
 */
@Module({
  controllers: [TranslationController],
  providers: [
    TranslationService,
    GoogleTranslateService,
    GlossaryService,
    PrismaService,
  ],
  exports: [
    TranslationService,
    GoogleTranslateService,
    GlossaryService,
  ],
})
export class TranslationModule {}
