import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { EntryStatus } from '@prisma/client';

export class ReviewEntryDto {
  @IsEnum(EntryStatus)
  @IsNotEmpty()
  status!: EntryStatus;

  @IsOptional()
  @IsString()
  reviewNote?: string;
}
