import {
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateItineraryDto {
  @ApiProperty({
    example: 'Bastar',
    description: 'District to plan the itinerary for',
  })
  @IsString()
  @IsNotEmpty()
  district!: string;

  @ApiProperty({
    example: 3,
    minimum: 1,
    maximum: 7,
    description: 'Trip duration in days',
  })
  @IsNumber()
  @Min(1)
  @Max(7)
  durationDays!: number;

  @ApiProperty({
    example: 'moderate',
    enum: ['slow', 'moderate', 'active'],
  })
  @IsString()
  @IsIn(['slow', 'moderate', 'active'])
  pace!: 'slow' | 'moderate' | 'active';

  @ApiPropertyOptional({
    example: ['nature', 'heritage'],
    description: 'Traveler interests',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  interests?: string[];

  @ApiPropertyOptional({
    example: 2,
    minimum: 1,
    maximum: 20,
    description: 'Number of travelers',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  travelers?: number;
}
