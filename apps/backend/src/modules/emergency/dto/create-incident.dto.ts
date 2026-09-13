import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EmergencySeverity } from '@prisma/client';
import {
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateIncidentDto {
  @ApiProperty({ description: 'Latitude coordinate of the emergency', example: 19.076 })
  @IsNumber()
  @IsNotEmpty()
  latitude!: number;

  @ApiProperty({ description: 'Longitude coordinate of the emergency', example: 81.961 })
  @IsNumber()
  @IsNotEmpty()
  longitude!: number;

  @ApiPropertyOptional({
    description: 'Incident type: MEDICAL, ACCIDENT, LOST, FIRE, WILDLIFE, WEATHER, CRIME, VEHICLE, OTHER',
    example: 'MEDICAL',
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({
    description: 'Incident severity level',
    enum: EmergencySeverity,
    default: EmergencySeverity.HIGH,
  })
  @IsOptional()
  @IsEnum(EmergencySeverity)
  severity?: EmergencySeverity;

  @ApiPropertyOptional({ description: 'Detailed description of the emergency' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ description: 'Associated trip or itinerary ID' })
  @IsOptional()
  @IsString()
  tripId?: string;
}
