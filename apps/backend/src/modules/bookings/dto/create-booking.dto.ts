import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({
    description: 'ID of the destination place',
  })
  @IsUUID('4')
  @IsNotEmpty()
  placeId!: string;

  @ApiProperty({
    description: 'Requested visit date',
    example: '2026-12-25T10:00:00.000Z',
  })
  @IsDateString()
  @IsNotEmpty()
  visitDate!: string;

  @ApiProperty({
    description: 'Number of guests',
    minimum: 1,
    maximum: 20,
  })
  @IsInt()
  @Min(1)
  @Max(20)
  guests!: number;

  @ApiPropertyOptional({
    description: 'Contact phone number',
  })
  @IsOptional()
  @IsString()
  @Length(7, 20)
  contactPhone?: string;

  @ApiPropertyOptional({
    description: 'Special booking notes',
  })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  notes?: string;
}
