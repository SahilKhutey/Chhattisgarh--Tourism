import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReorderStopDto {
  @ApiProperty({ example: 'stop-cuid-123' })
  @IsString()
  @IsNotEmpty()
  stopId!: string;

  @ApiProperty({ example: 1, description: 'Target day sequence (1-indexed)' })
  @IsInt()
  @Min(1)
  targetDaySequence!: number;

  @ApiProperty({ example: 2, description: 'Target stop sequence within day (1-indexed)' })
  @IsInt()
  @Min(1)
  targetStopSequence!: number;
}
