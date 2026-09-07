import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUrl,
  Min,
  Max,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePlaceDto {
  @ApiProperty({ example: 'Chitrakote Falls' })
  @IsString()
  @IsNotEmpty({ message: 'Place name is required.' })
  name: string;

  @ApiProperty({ example: 'Widest waterfall in India on the Indravati river.' })
  @IsString()
  @IsNotEmpty({ message: 'Place description is required.' })
  description: string;

  @ApiProperty({ example: 'Bastar' })
  @IsString()
  @IsNotEmpty({ message: 'District classification is required.' })
  district: string;

  @ApiProperty({ example: 'waterfalls-category-uuid' })
  @IsString()
  @IsNotEmpty({ message: 'Category identifier is required.' })
  categoryId: string;

  @ApiProperty({ example: 19.2006 })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({ example: 81.6961 })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1' })
  @IsOptional()
  @IsUrl({}, {
    message: 'Hero image must be a valid URL when supplied.',
  })
  heroImage?: string;

  @ApiPropertyOptional({ example: 'October to March' })
  @IsOptional()
  @IsString()
  bestSeason?: string;

  @ApiPropertyOptional({ example: 'Ancient folklore links the falls to Indravati river blessings.' })
  @IsOptional()
  @IsString()
  history?: string;

  @ApiPropertyOptional({ example: 'Stay within marked railings.' })
  @IsOptional()
  @IsString()
  safetyInfo?: string;

  @ApiPropertyOptional({ example: 'Plastic-free eco zone.' })
  @IsOptional()
  @IsString()
  rules?: string;

  @ApiPropertyOptional({ example: 'INTERNAL' })
  @IsOptional()
  @IsString()
  sourceType?: string;

  @ApiPropertyOptional({ example: 'CG Tourism' })
  @IsOptional()
  @IsString()
  sourceName?: string;

  @ApiPropertyOptional({ example: 'https://cgtourism.gov.in' })
  @IsOptional()
  @IsUrl()
  sourceUrl?: string;

  @ApiPropertyOptional({ example: 'https://cdn.cgtourism.gov.in/audio/chitrakote.mp3' })
  @IsOptional()
  @IsString()
  audioUrl?: string;

  @ApiPropertyOptional({ example: 'Mangal Ram, Tribal Elder' })
  @IsOptional()
  @IsString()
  audioNarrator?: string;

  @ApiPropertyOptional({ example: ['Widest waterfall in India'] })
  @IsOptional()
  @IsArray()
  highlights?: string[];

  @ApiPropertyOptional({ example: ['Nature', 'Adventure'] })
  @IsOptional()
  @IsArray()
  experienceTypes?: string[];

  @ApiPropertyOptional({ example: ['Monsoon travel alerts'] })
  @IsOptional()
  @IsArray()
  platformFeatures?: string[];
}
