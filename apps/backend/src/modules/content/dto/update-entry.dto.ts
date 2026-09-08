import {
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateEntryDto {
  @IsOptional()
  @IsObject()
  data?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  division?: string;
}
