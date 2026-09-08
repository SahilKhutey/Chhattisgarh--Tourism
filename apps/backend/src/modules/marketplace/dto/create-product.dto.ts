import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InventoryType } from '@prisma/client';

export class CancellationPolicyDto {
  @ApiPropertyOptional({ default: 48, description: 'Hours before start for 100% refund' })
  @IsOptional()
  @IsInt()
  @Min(0)
  fullRefundHours?: number;

  @ApiPropertyOptional({ default: 24, description: 'Hours before start for partial refund' })
  @IsOptional()
  @IsInt()
  @Min(0)
  partialRefundHours?: number;

  @ApiPropertyOptional({ default: 50, description: 'Partial refund percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  partialRefundPercent?: number;
}

export class CreateProductDto {
  @ApiProperty({ description: 'ID of the partner owning this product' })
  @IsUUID('4')
  @IsNotEmpty()
  partnerId!: string;

  @ApiProperty({ description: 'Product title / name', example: 'Bastar Tribal Village & Craft Immersion' })
  @IsString()
  @IsNotEmpty()
  @Length(3, 150)
  name!: string;

  @ApiPropertyOptional({ description: 'Unique URL slug (auto-generated if omitted)' })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9-]+$/, { message: 'Slug must be lowercase alphanumeric with hyphens' })
  slug?: string;

  @ApiProperty({ description: 'Detailed product description' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ enum: InventoryType, description: 'Product type' })
  @IsEnum(InventoryType)
  @IsNotEmpty()
  type!: InventoryType;

  @ApiProperty({ description: 'Price in INR', example: 1499.0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiPropertyOptional({ default: 'INR' })
  @IsOptional()
  @IsString()
  currency?: string = 'INR';

  @ApiProperty({ description: 'Maximum guests / capacity per slot', example: 12 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  capacity!: number;

  @ApiPropertyOptional({ description: 'Duration in minutes', example: 240 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  durationMin?: number;

  @ApiPropertyOptional({ description: 'Latitude coordinate' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ description: 'Longitude coordinate' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ description: 'Product cancellation policy' })
  @IsOptional()
  @ValidateNested()
  @Type(() => CancellationPolicyDto)
  cancellationPolicy?: CancellationPolicyDto;
}
