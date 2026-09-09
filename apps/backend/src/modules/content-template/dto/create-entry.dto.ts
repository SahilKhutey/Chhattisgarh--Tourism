import {
  IsLatitude,
  IsLongitude,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateEntryDto {
  @IsString()
  templateId!: string;

  @IsString()
  slug!: string;

  @IsObject()
  data!: Record<string, unknown>;

  @IsString()
  @IsOptional()
  region?: string;

  @IsLatitude()
  @IsOptional()
  latitude?: number;

  @IsLongitude()
  @IsOptional()
  longitude?: number;
}
