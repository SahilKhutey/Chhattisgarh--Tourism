import { IsLatitude, IsLongitude } from 'class-validator';
import { Type } from 'class-transformer';

export class BoundsDto {
  @Type(() => Number)
  @IsLatitude()
  north!: number;

  @Type(() => Number)
  @IsLatitude()
  south!: number;

  @Type(() => Number)
  @IsLongitude()
  east!: number;

  @Type(() => Number)
  @IsLongitude()
  west!: number;
}
