import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ApplyCreatorDto {
  @ApiPropertyOptional({ description: 'Short creator biography' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @ApiPropertyOptional({ description: 'Primary district in Chhattisgarh' })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional({ description: 'Creator specialty (e.g. Photography, Food, Culture, Trekking)' })
  @IsOptional()
  @IsString()
  specialty?: string;
}
