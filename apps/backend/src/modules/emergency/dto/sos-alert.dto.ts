import { IsNumber, IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class SosAlertDto {
  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsString()
  @IsNotEmpty({ message: 'Tourist full name is required for rescue coordination.' })
  touristName: string;

  @IsString()
  @IsOptional()
  touristPhone?: string;

  @IsString()
  @IsOptional()
  medicalNotes?: string;
}
