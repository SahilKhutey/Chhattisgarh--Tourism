import {
  IsArray,
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTripDto {
  @ApiProperty({ example: 'Bastar Monsoon Exploration' })
  @IsString()
  title!: string;

  @ApiProperty({ example: '2026-10-01' })
  @IsDateString()
  startDate!: string;

  @ApiProperty({ example: '2026-10-04' })
  @IsDateString()
  endDate!: string;

  @ApiPropertyOptional({ example: 2, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  travelers?: number = 1;

  @ApiPropertyOptional({ example: 21.2514 })
  @IsOptional()
  @IsNumber()
  originLatitude?: number;

  @ApiPropertyOptional({ example: 81.6296 })
  @IsOptional()
  @IsNumber()
  originLongitude?: number;

  @ApiPropertyOptional({ example: ['nature', 'waterfalls', 'tribal-culture'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @ApiPropertyOptional({ example: 'BALANCED', enum: ['RELAXED', 'BALANCED', 'FAST'] })
  @IsOptional()
  @IsIn(['RELAXED', 'BALANCED', 'FAST'])
  pace?: 'RELAXED' | 'BALANCED' | 'FAST' = 'BALANCED';

  @ApiPropertyOptional({ example: 5000 })
  @IsOptional()
  @IsPositive()
  budgetAmount?: number;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  accessibilityRequired?: boolean;
}
