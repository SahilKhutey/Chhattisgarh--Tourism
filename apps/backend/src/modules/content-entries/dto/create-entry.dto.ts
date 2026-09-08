import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { EntryStatus } from '@prisma/client';

export class CreateEntryDto {
  @IsString()
  @IsNotEmpty()
  templateId!: string;

  @IsObject()
  data!: Record<string, unknown>;

  @IsOptional()
  @IsEnum(EntryStatus)
  status?: EntryStatus;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsNumber()
  lat?: number;

  @IsOptional()
  @IsNumber()
  lng?: number;
}
