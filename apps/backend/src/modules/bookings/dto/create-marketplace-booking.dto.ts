import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMarketplaceBookingDto {
  @ApiProperty({ description: 'ID of the marketplace tourism product' })
  @IsUUID('4')
  @IsNotEmpty()
  productId!: string;

  @ApiProperty({ description: 'ID of the product availability slot' })
  @IsUUID('4')
  @IsNotEmpty()
  availabilityId!: string;

  @ApiProperty({ description: 'Number of guests / slots booked', minimum: 1, default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity!: number;

  @ApiPropertyOptional({ description: 'Contact phone number' })
  @IsOptional()
  @IsString()
  @Length(7, 20)
  contactPhone?: string;

  @ApiPropertyOptional({ description: 'Special booking requests or notes' })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  notes?: string;
}
