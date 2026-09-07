import { IsString, IsNotEmpty, IsNumber, IsOptional, IsUrl, Min, Max, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePlaceDto {
  @ApiProperty({ example: 'Chitrakote Falls', description: 'Name of the tourism destination' })
  @IsString()
  @IsNotEmpty({ message: 'Place name is required.' })
  name: string;

  @ApiProperty({ example: 'Widest waterfall in India on the Indravati river.', description: 'Detailed destination overview' })
  @IsString()
  @IsNotEmpty({ message: 'Place description is required.' })
  description: string;

  @ApiProperty({ example: 'Bastar', description: 'Official Chhattisgarh district' })
  @IsString()
  @IsNotEmpty({ message: 'District classification is required.' })
  district: string;

  @ApiProperty({ example: 'waterfalls-category-uuid', description: 'Foreign key ID of the tourism category' })
  @IsString()
  @IsNotEmpty({ message: 'Category identifier is required.' })
  categoryId: string;

  @ApiProperty({ example: 19.2006, description: 'Latitude coordinate (17.0 to 25.0 N for Chhattisgarh)' })
  @IsNumber()
  @Min(17.0, { message: 'Latitude must be within Chhattisgarh geographic region (>= 17.0)' })
  @Max(25.0, { message: 'Latitude must be within Chhattisgarh geographic region (<= 25.0)' })
  latitude: number;

  @ApiProperty({ example: 81.6961, description: 'Longitude coordinate (80.0 to 85.0 E for Chhattisgarh)' })
  @IsNumber()
  @Min(80.0, { message: 'Longitude must be within Chhattisgarh geographic region (>= 80.0)' })
  @Max(85.0, { message: 'Longitude must be within Chhattisgarh geographic region (<= 85.0)' })
  longitude: number;

  @ApiProperty({ example: 'https://images.unsplash.com/photo-1628105740446', description: 'Hero banner image URL' })
  @IsUrl({}, { message: 'Hero image must be a valid URL.' })
  heroImage: string;

  @ApiPropertyOptional({ example: 'October to March', description: 'Best season to visit' })
  @IsString()
  @IsOptional()
  bestSeason?: string;

  @ApiPropertyOptional({ example: 'Ancient folklore links the falls to Indravati river blessings.', description: 'Cultural lore or historical notes' })
  @IsString()
  @IsOptional()
  history?: string;

  @ApiPropertyOptional({ example: 'Stay within marked railings during peak monsoon discharge.', description: 'Safety warnings and guidelines' })
  @IsString()
  @IsOptional()
  safetyInfo?: string;

  @ApiPropertyOptional({ example: 'Plastic-free eco zone. Littering strictly prohibited.', description: 'Environmental and behavioral rules' })
  @IsString()
  @IsOptional()
  rules?: string;

  @ApiPropertyOptional({ example: 'https://cdn.cgtourism.gov.in/audio/chitrakote.mp3', description: 'Narrated audio guide URL' })
  @IsString()
  @IsOptional()
  audioUrl?: string;

  @ApiPropertyOptional({ example: 'Mangal Ram, Tribal Elder', description: 'Narrator name or elder attribution' })
  @IsString()
  @IsOptional()
  audioNarrator?: string;

  @ApiPropertyOptional({ example: ['Widest waterfall in India', 'Horseshoe cascade'], description: 'Key bullet points' })
  @IsArray()
  @IsOptional()
  highlights?: string[];

  @ApiPropertyOptional({ example: ['Nature', 'Adventure', 'Photography'], description: 'Experience taxonomy tags' })
  @IsArray()
  @IsOptional()
  experienceTypes?: string[];

  @ApiPropertyOptional({ example: ['Monsoon travel alerts', 'Viewpoint maps'], description: 'Platform features enabled' })
  @IsArray()
  @IsOptional()
  platformFeatures?: string[];
}
