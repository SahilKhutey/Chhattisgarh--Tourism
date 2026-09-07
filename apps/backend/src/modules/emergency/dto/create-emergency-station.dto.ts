import {
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateEmergencyStationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  phone!: string;

  @IsIn(['POLICE', 'HOSPITAL', 'RANGER'])
  type!: 'POLICE' | 'HOSPITAL' | 'RANGER';

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  district!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  division?: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude!: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1000)
  priority?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  capabilities?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
