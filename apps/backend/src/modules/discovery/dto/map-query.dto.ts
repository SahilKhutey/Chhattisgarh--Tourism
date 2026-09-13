import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class MapQueryDto {
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  north!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  south!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  east!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  west!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(22)
  zoom: number = 8;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  limit: number = 200;
}
