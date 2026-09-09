import { IsIn, IsOptional, IsString } from 'class-validator';

export class ReviewEntryDto {
  @IsIn(['PUBLISH', 'REJECT'])
  action!: 'PUBLISH' | 'REJECT';

  @IsString()
  @IsOptional()
  note?: string;
}
