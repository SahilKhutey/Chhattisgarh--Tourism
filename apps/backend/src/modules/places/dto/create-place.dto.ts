import { IsString, IsNotEmpty, IsNumber, IsOptional, IsUrl } from 'class-validator';

export class CreatePlaceDto {
  @IsString()
  @IsNotEmpty({ message: 'Place name is required.' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Place description is required.' })
  description: string;

  @IsString()
  @IsNotEmpty({ message: 'District classification is required.' })
  district: string;

  @IsString()
  @IsNotEmpty({ message: 'Category identifier is required.' })
  categoryId: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsUrl({}, { message: 'Hero image must be a valid URL.' })
  heroImage: string;

  @IsString()
  @IsOptional()
  bestSeason?: string;

  @IsString()
  @IsOptional()
  history?: string;

  @IsString()
  @IsOptional()
  safetyInfo?: string;

  @IsString()
  @IsOptional()
  rules?: string;
}
