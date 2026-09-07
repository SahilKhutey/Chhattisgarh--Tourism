import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateReportDto {
  @IsIn(['VIDEO', 'COMMENT', 'FOLKLORE', 'CREATOR'])
  targetType!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  targetId!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(100)
  reason!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  details?: string;
}
