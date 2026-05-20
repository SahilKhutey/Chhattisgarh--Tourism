import { IsString, IsNotEmpty, Length, IsOptional } from 'class-validator';

export class RegisterCreatorDto {
  @IsString({ message: 'Bio must be a string.' })
  @IsNotEmpty({ message: 'Bio is required to register as a verified creator.' })
  @Length(10, 300, { message: 'Bio must be between 10 and 300 characters long.' })
  bio: string;

  @IsString({ message: 'Instagram handle must be a string.' })
  @IsOptional()
  instagram?: string;

  @IsString({ message: 'YouTube channel name must be a string.' })
  @IsOptional()
  youtube?: string;
}
