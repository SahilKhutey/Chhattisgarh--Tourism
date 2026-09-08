import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePaymentIntentDto {
  @ApiProperty({ description: 'Booking ID to initiate payment for' })
  @IsUUID('4')
  @IsNotEmpty()
  bookingId!: string;

  @ApiPropertyOptional({ description: 'Unique idempotency key for safely retrying payment initiation' })
  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}
