import { IsString, IsNotEmpty, IsNumber, IsDateString, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({ description: 'ID of the place to book' })
  @IsString()
  @IsNotEmpty()
  placeId: string;

  @ApiProperty({ description: 'Date of the visit' })
  @IsDateString()
  @IsNotEmpty()
  visitDate: string;

  @ApiProperty({ description: 'Number of guests', default: 1 })
  @IsNumber()
  @Min(1)
  guests: number;

  @ApiProperty({ description: 'Optional contact phone number', required: false })
  @IsString()
  @IsOptional()
  contactPhone?: string;

  @ApiProperty({ description: 'Optional special notes', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
