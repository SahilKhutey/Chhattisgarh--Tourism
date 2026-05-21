import { Controller, Get, Post, Body, Query, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { TranslationService } from './translation.service';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

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

@ApiTags('translations')
@Controller('translations')
export class TranslationController {
  constructor(private readonly translationService: TranslationService) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve formatted translation dictionary for a language' })
  @ApiQuery({ name: 'lang', description: 'Language code (e.g. en, hi, cg)', required: true })
  @ApiQuery({ name: 'entityType', description: 'Filter by entity type (Place, Category)', required: false })
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

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate a translation string against the regional tourism glossary' })
  @ApiResponse({ status: 200, description: 'Validation completed' })
  validateTranslation(@Body() dto: ValidateTranslationDto) {
    if (!dto.text || !dto.lang) {
      throw new BadRequestException('Fields text and lang are required');
    }
    return this.translationService.validateTranslation(dto.text, dto.lang);
  }

  @Post()
  @ApiOperation({ summary: 'Insert or update translation record' })
  @ApiResponse({ status: 201, description: 'Translation saved successfully' })
  async upsertTranslation(@Body() dto: CreateTranslationDto) {
    const { lang, entityType, entityId, field, value } = dto;
    if (!lang || !entityType || !entityId || !field || !value) {
      throw new BadRequestException('All fields (lang, entityType, entityId, field, value) are required');
    }
    return this.translationService.upsertTranslation(lang, entityType, entityId, field, value);
  }
}
