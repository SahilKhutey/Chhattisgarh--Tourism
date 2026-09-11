import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum TemplateStatusFilter {
  ALL = 'ALL',
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum TemplateSortBy {
  NAME = 'name',
  UPDATED_AT = 'updatedAt',
  ENTRY_COUNT = 'entryCount',
}

export class QueryTemplatesDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsEnum(TemplateStatusFilter)
  @IsOptional()
  status?: TemplateStatusFilter = TemplateStatusFilter.ALL;

  @IsString()
  @IsOptional()
  category?: string;

  @IsEnum(TemplateSortBy)
  @IsOptional()
  sortBy?: TemplateSortBy = TemplateSortBy.UPDATED_AT;

  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'desc';

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  pageSize?: number = 25;
}
