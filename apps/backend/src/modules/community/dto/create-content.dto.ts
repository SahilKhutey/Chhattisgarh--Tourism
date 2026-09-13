import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateContentDto {
  @ApiProperty({ description: 'Content type: STORY, VIDEO, PHOTO, GUIDE, FOLKLORE, EXPERIENCE', example: 'STORY' })
  @IsString()
  @IsNotEmpty()
  type!: string;

  @ApiProperty({ description: 'Content title', example: 'Hidden Waterfalls of Kanger Valley' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @ApiPropertyOptional({ description: 'Content description or narrative body' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Primary media URL (image/video)' })
  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @ApiPropertyOptional({ description: 'Location label' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: 'Associated Place ID' })
  @IsOptional()
  @IsString()
  placeId?: string;

  @ApiPropertyOptional({ description: 'Language code', example: 'en' })
  @IsOptional()
  @IsString()
  language?: string;
}
