import { IsIn, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VerifyPlaceDto {
  @ApiProperty({ example: 'APPROVED', enum: ['APPROVED', 'REJECTED', 'REVOKED'] })
  @IsIn(['APPROVED', 'REJECTED', 'REVOKED'])
  decision: string;

  @ApiPropertyOptional({ example: 'OFFICIAL', enum: ['COMMUNITY', 'CREATOR_VERIFIED', 'OFFICIAL'] })
  @IsOptional()
  @IsIn(['COMMUNITY', 'CREATOR_VERIFIED', 'OFFICIAL'])
  verificationLevel?: string;

  @ApiPropertyOptional({ example: 'Ground truth confirmed by district authority.', description: 'Review notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
