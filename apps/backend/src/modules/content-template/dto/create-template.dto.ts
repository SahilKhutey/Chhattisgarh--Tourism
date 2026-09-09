import {
  IsArray,
  IsBoolean,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTemplateFieldDto {
  @IsString()
  key!: string;

  @IsString()
  label!: string;

  @IsString()
  fieldType!: string;

  @IsBoolean()
  @IsOptional()
  required?: boolean;

  @IsInt()
  @Min(0)
  order!: number;

  @IsBoolean()
  @IsOptional()
  translatable?: boolean;

  @IsString()
  @IsOptional()
  helpText?: string;

  @IsObject()
  @IsOptional()
  options?: Record<string, unknown>;
}

export class CreateTemplateDto {
  @IsString()
  name!: string;

  @IsString()
  slug!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTemplateFieldDto)
  fields!: CreateTemplateFieldDto[];
}
