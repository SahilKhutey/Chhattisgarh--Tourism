import {
  IsArray,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateTemplateFieldInput } from './template-field-options.dto';

export class CreateTemplateDto {
  @IsString()
  @MaxLength(120)
  name!: string;

  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object)
  fields!: CreateTemplateFieldInput[];
}
