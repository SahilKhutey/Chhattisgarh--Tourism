import { TranslateDto } from './dto/translate.dto';
import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { TranslationService } from './translation.service';
import { GlossaryEntry } from './glossary.service';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';

// ─── DTOs ────────────────────────────────────────────────────────────────────


class CreateTranslationDto {
  lang: string;
  entityType: string;
  entityId: string;
  field: string;
  value: string;
}

class ValidateTranslationDto {
  text: string;
  lang: string;
}

/**
 * LiveTranslationDto
 * Request body for the live Google Translate endpoint.
 */
class LiveTranslationDto {
  /** The source text to translate (usually English). */
  text: string;

  /** Platform source language code: 'en', 'hi', 'cg'. Default: 'en'. */
  sourceLang?: string;

  /** Platform target language code: 'hi' or 'cg'. */
  targetLang: string;
}

/**
 * BatchTranslationDto
 * Request body for bulk translation of multiple strings in one API call.
 */
class BatchTranslationDto {
  /** Array of source texts to translate. */
  texts: string[];

  /** Platform source language code. Default: 'en'. */
  sourceLang?: string;

  /** Platform target language code: 'hi' or 'cg'. */
  targetLang: string;
}

// ─── Controller ──────────────────────────────────────────────────────────────

@ApiTags('translations')
@Controller(['translation', 'translations'])
export class TranslationController {
  constructor(private readonly translationService: TranslationService) {}

  // ── Static DB Translations ───────────────────────────────────────────────

  @Get()
  @ApiOperation({
    summary: 'Retrieve formatted static translation dictionary for a language',
  })
  @ApiQuery({
    name: 'lang',
    description: 'Language code (e.g. en, hi, cg)',
    required: true,
  })
  @ApiQuery({
    name: 'entityType',
    description: 'Filter by entity type (Place, Category, Folklore)',
    required: false,
  })
  @ApiResponse({ status: 200, description: 'Translations retrieved successfully' })
  async getTranslations(
    @Query('lang') lang: string,
    @Query('entityType') entityType?: string,
  ) {
    if (!lang) {
      throw new BadRequestException('Language code (lang) parameter is required');
    }
    return this.translationService.getTranslations(lang, entityType);
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Translate text or upsert translation record',
    description: 'Translates text with multi-tier fallback (memory -> cache -> glossary -> google -> original) or saves a static record if entityId is provided.',
  })
  @ApiResponse({ status: 200, description: 'Translation or upsert successful' })
  async handlePost(@Body() body: any) {
    if (body.text !== undefined && body.target !== undefined) {
      return this.translationService.translate(body.text, body.source ?? 'en', body.target);
    }
    if (body.lang && body.entityType && body.entityId && body.field && body.value) {
      return this.translationService.upsertTranslation(
        body.lang,
        body.entityType,
        body.entityId,
        body.field,
        body.value,
      );
    }
    throw new BadRequestException(
      'Invalid payload: provide { text, target, source? } for translation or { lang, entityType, entityId, field, value } for upsert',
    );
  }

  // ── Live Google Translate Endpoints ──────────────────────────────────────

  /**
   * POST /translations/live
   * Translate dynamic user content via Google Cloud Translation API.
   * Applies Chhattisgarhi Glossary post-processing for 'cg' target.
   * Results are cached in SQLite + memory for subsequent calls.
   */
  @Post('live')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Live-translate text using Google Cloud Translation API',
    description:
      'Translates dynamic user-generated content (reviews, comments, folklore). ' +
      'Applies regional Chhattisgarhi glossary for cg target. Results are cached.',
  })
  @ApiBody({ type: LiveTranslationDto })
  @ApiResponse({
    status: 200,
    description: 'Translation result with cache status',
  })
  async translateLive(@Body() dto: LiveTranslationDto) {
    if (!dto.text || !dto.targetLang) {
      throw new BadRequestException(
        'Fields "text" and "targetLang" are required',
      );
    }
    return this.translationService.translateLive(
      dto.text,
      dto.targetLang,
      dto.sourceLang ?? 'en',
    );
  }

  /**
   * POST /translations/batch
   * Batch-translate multiple strings in a single API call.
   * More cost-efficient than calling /live repeatedly.
   */
  @Post('batch')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Batch-translate multiple strings in a single Google API call',
  })
  @ApiBody({ type: BatchTranslationDto })
  @ApiResponse({ status: 200, description: 'Batch translation result' })
  async batchTranslate(@Body() dto: BatchTranslationDto) {
    if (!dto.texts?.length || !dto.targetLang) {
      throw new BadRequestException(
        'Fields "texts" (array) and "targetLang" are required',
      );
    }
    return this.translationService.batchTranslateLive(
      dto.texts,
      dto.targetLang,
      dto.sourceLang ?? 'en',
    );
  }

  // ── Validation & Glossary ────────────────────────────────────────────────

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Validate a translation string against the regional tourism glossary',
  })
  @ApiResponse({ status: 200, description: 'Validation completed' })
  validateTranslation(@Body() dto: ValidateTranslationDto) {
    if (!dto.text || !dto.lang) {
      throw new BadRequestException('Fields text and lang are required');
    }
    return this.translationService.validateTranslation(dto.text, dto.lang);
  }

  @Get('glossary')
  @ApiOperation({ summary: 'Retrieve the full Chhattisgarhi regional tourism glossary' })
  @ApiResponse({ status: 200, description: 'Glossary entries returned' })
  getGlossary(): Record<string, GlossaryEntry> {
    return this.translationService.getGlossary();
  }
}
