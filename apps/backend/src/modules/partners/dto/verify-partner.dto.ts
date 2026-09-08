import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartnerStatus } from '@prisma/client';

export class VerifyPartnerDto {
  @ApiProperty({ enum: PartnerStatus, description: 'Verification verdict' })
  @IsEnum(PartnerStatus)
  @IsNotEmpty()
  status!: PartnerStatus;

  @ApiPropertyOptional({ description: 'Reason or verification notes' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class SuspendPartnerDto {
  @ApiProperty({ description: 'Reason for suspension' })
  @IsString()
  @IsNotEmpty()
  reason!: string;
}
