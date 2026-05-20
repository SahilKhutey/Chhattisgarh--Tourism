import { IsUUID, IsNotEmpty } from 'class-validator';

export class ToggleBookmarkDto {
  @IsUUID('4', { message: 'Place ID must be a valid UUID.' })
  @IsNotEmpty({ message: 'Place ID is required to bookmark destinations.' })
  placeId: string;
}
