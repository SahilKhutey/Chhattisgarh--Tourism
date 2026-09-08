import { IsOptional, IsString, IsUUID, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RequestRefundDto {
  @ApiProperty({ description: 'Booking ID to cancel and refund' })
  @IsUUID('4')
  bookingId!: string;

  @ApiPropertyOptional({ description: 'Reason for cancellation / refund request' })
  @IsOptional()
  @IsString()
  @Length(3, 500)
  reason?: string;
}
