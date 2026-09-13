import { ApiProperty } from '@nestjs/swagger';
import { IncidentStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateIncidentStatusDto {
  @ApiProperty({
    description: 'Target incident lifecycle status',
    enum: IncidentStatus,
  })
  @IsEnum(IncidentStatus)
  @IsNotEmpty()
  status!: IncidentStatus;
}
