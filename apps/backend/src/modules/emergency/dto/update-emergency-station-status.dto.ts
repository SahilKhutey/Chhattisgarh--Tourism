import { IsBoolean } from 'class-validator';

export class UpdateEmergencyStationStatusDto {
  @IsBoolean()
  active!: boolean;
}
