import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDeviceDto {
  @ApiProperty({
    description: 'Native push notification token (APNs or FCM)',
    example: 'dK9Xv1234567890abcdef1234567890abcdef',
  })
  @IsString()
  @MinLength(20)
  @MaxLength(4096)
  deviceToken!: string;

  @ApiProperty({
    description: 'Operating system platform',
    enum: ['android', 'ios'],
    example: 'android',
  })
  @IsIn(['android', 'ios'])
  platform!: 'android' | 'ios';

  @ApiProperty({
    description: 'Semantic mobile application version',
    example: '1.0.0',
  })
  @IsString()
  @MaxLength(50)
  appVersion!: string;

  @ApiPropertyOptional({
    description: 'Unique client device identifier',
    example: 'device-uuid-1234-5678',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  deviceId?: string;
}
