import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PlanItineraryDto {
  @ApiPropertyOptional({ example: 'BALANCED', enum: ['RELAXED', 'BALANCED', 'FAST'] })
  @IsOptional()
  @IsIn(['RELAXED', 'BALANCED', 'FAST'])
  pace?: 'RELAXED' | 'BALANCED' | 'FAST' = 'BALANCED';

  @ApiPropertyOptional({ example: ['nature', 'waterfalls'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @ApiPropertyOptional({ example: 480, minimum: 60, maximum: 1440 })
  @IsOptional()
  @IsInt()
  @Min(60)
  @Max(1440)
  maxDailyTravelMin?: number;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  accessibilityRequired?: boolean;

  @ApiPropertyOptional({ example: ['place-1', 'place-2'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredPlaceIds?: string[];

  @ApiPropertyOptional({ example: ['place-3'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludedPlaceIds?: string[];

  @ApiPropertyOptional({ example: 10000 })
  @IsOptional()
  @IsPositive()
  budgetAmount?: number;
}
