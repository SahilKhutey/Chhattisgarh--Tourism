import { IsDateString, IsInt, IsNotEmpty, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAvailabilityDto {
  @ApiProperty({ description: 'Slot start date-time', example: '2026-11-10T09:00:00.000Z' })
  @IsDateString()
  @IsNotEmpty()
  startAt!: string;

  @ApiProperty({ description: 'Slot end date-time', example: '2026-11-10T17:00:00.000Z' })
  @IsDateString()
  @IsNotEmpty()
  endAt!: string;

  @ApiProperty({ description: 'Maximum slot capacity', example: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  capacity!: number;
}
