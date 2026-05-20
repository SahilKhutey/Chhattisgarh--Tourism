import { IsString, IsOptional, IsUrl, Length } from 'class-validator';

export class UpdateProfileDto {
  @IsString({ message: 'Full name must be a string.' })
  @IsOptional()
  @Length(3, 100, { message: 'Full name must be between 3 and 100 characters.' })
  fullName?: string;

  @IsUrl({}, { message: 'Avatar must be a valid URL link.' })
  @IsOptional()
  avatar?: string;
}
