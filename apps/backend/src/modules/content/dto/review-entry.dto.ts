import {
  IsBoolean,
  IsOptional,
  IsString,
} from 'class-validator';

export class ReviewEntryDto {
  @IsBoolean()
  approved!: boolean;

  @IsOptional()
  @IsString()
  note?: string;
}
