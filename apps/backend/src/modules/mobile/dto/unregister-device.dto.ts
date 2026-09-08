import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class UnregisterDeviceDto {
  @ApiProperty({
    description: 'Native push notification token to deactivate',
    example: 'dK9Xv1234567890abcdef1234567890abcdef',
  })
  @IsString()
  @MinLength(20)
  @MaxLength(4096)
  deviceToken!: string;
}
