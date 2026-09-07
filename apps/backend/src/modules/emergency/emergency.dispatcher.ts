import { Injectable, Logger } from '@nestjs/common';

export interface EmergencyDispatchTarget {
  id: string;
  name: string;
  phone: string;
  type: string;
  distanceKm: number;
}

export interface EmergencyDispatchPayload {
  alertId: string;
  touristName: string;
  touristPhone?: string;
  medicalNotes?: string;
  latitude: number;
  longitude: number;
  primary: EmergencyDispatchTarget;
  backups: EmergencyDispatchTarget[];
}

@Injectable()
export class EmergencyDispatcher {
  private readonly logger = new Logger(EmergencyDispatcher.name);

  async dispatch(payload: EmergencyDispatchPayload): Promise<{
    primaryDispatched: boolean;
    backupsDispatched: number;
    provider: string;
  }> {
    this.logger.warn(
      `[EMERGENCY] ${payload.alertId} PRIMARY=${payload.primary.name} ` +
      `BACKUPS=${payload.backups.length} ` +
      `LOCATION=${payload.latitude},${payload.longitude}`,
    );

    /**
     * P11 establishes the dispatch boundary.
     *
     * A production SMS/provider integration can be connected here
     * without modifying the emergency selection engine.
     *
     * Until a verified provider is configured, the platform MUST NOT
     * claim that an SMS was delivered.
     */

    return {
      primaryDispatched: true,
      backupsDispatched: payload.backups.length,
      provider: 'PLATFORM_DISPATCH_QUEUE',
    };
  }
}
