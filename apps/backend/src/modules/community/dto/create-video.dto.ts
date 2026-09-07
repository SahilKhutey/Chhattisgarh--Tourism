import { IsOptional, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';

export class CreateVideoDto {
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  location!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  district!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  category!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(20)
  language!: string;

  @IsString()
  @IsUrl()
  thumbnailUrl!: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  videoUrl?: string;
}
