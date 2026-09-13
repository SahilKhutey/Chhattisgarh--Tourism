import { IsArray, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegenerateDayDto {
  @ApiProperty({ example: 1, description: 'Day sequence to regenerate' })
  @IsInt()
  @Min(1)
  daySequence!: number;

  @ApiPropertyOptional({
    example: ['stop-id-1'],
    description: 'Stop IDs that should remain locked and unchanged',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  lockedStopIds?: string[];
}
