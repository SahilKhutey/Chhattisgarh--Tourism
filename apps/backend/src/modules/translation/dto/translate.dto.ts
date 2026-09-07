import { IsNotEmpty, IsOptional, IsString, IsIn, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TranslateDto {
  @ApiProperty({
    description: 'The text content to translate',
    maxLength: 5000,
    example: 'Welcome to Chitrakote Waterfalls',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  text: string;

  @ApiPropertyOptional({
    description: 'Source language code (default: en)',
    example: 'en',
    enum: ['en', 'hi', 'hne', 'cg'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['en', 'hi', 'hne', 'cg'])
  source?: string;

  @ApiProperty({
    description: 'Target language code (e.g. hi, hne, cg, en)',
    example: 'hi',
    enum: ['en', 'hi', 'hne', 'cg'],
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['en', 'hi', 'hne', 'cg'])
  target: string;
}
