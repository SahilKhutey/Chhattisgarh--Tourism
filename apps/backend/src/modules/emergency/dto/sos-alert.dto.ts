import {
  IsNumber,
  IsString,
  IsNotEmpty,
  IsOptional,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class SosAlertDto {
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude!: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude!: number;

  @IsString()
  @IsNotEmpty({
    message: 'Tourist full name is required for rescue coordination.',
  })
  @MaxLength(150)
  touristName!: string;

  @IsString()
  @IsOptional()
  @MaxLength(30)
  touristPhone?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  medicalNotes?: string;
}
