import { IsArray, IsOptional, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';

export class CreateFolkloreDto {
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(200)
  monument!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(200)
  location!: string;

  @IsString()
  @MinLength(20)
  @MaxLength(10000)
  description!: string;

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  images?: string[];

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  videos?: string[];

  @IsOptional()
  @IsUrl()
  audioUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  audioNarrator?: string;
}
