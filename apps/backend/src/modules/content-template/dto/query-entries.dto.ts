import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { EntryStatus } from '@prisma/client';

export class QueryEntriesDto {
  @IsOptional()
  @IsString()
  templateId?: string;

  @IsOptional()
  @IsString()
  templateSlug?: string;

  @IsOptional()
  @IsEnum(EntryStatus)
  status?: EntryStatus;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 20;

  @IsOptional()
  @IsString()
  search?: string;
}
