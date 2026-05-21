import { IsString, IsNotEmpty, IsNumber, Min, Max, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateItineraryDto {
  @ApiProperty({ example: 'Bastar', description: 'The district to plan the itinerary for' })
  @IsString()
  @IsNotEmpty({ message: 'District is required.' })
  district: string;

  @ApiProperty({ example: 3, description: 'Duration of the itinerary in days (1-7)' })
  @IsNumber()
  @Min(1)
  @Max(7)
  durationDays: number;

  @ApiProperty({ example: 'moderate', enum: ['slow', 'moderate', 'active'], description: 'Pacing of the itinerary' })
  @IsString()
  @IsIn(['slow', 'moderate', 'active'], { message: 'Pace must be slow, moderate, or active.' })
  pace: 'slow' | 'moderate' | 'active';
}
