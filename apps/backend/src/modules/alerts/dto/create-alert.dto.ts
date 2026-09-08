import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AlertSeverity, AlertType } from '../types/alert.type';

export class CreateAlertDto {
  @IsString()
  @IsNotEmpty()
  type!: AlertType | string;

  @IsEnum(AlertSeverity)
  severity!: AlertSeverity;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsOptional()
  @IsString()
  districtId?: string;

  @IsOptional()
  @IsString()
  placeId?: string;

  @IsOptional()
  metadata?: Record<string, unknown>;
}
