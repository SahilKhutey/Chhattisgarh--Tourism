export type MobilePlatform = 'web' | 'android' | 'ios';

export interface MobilePosition {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number | null;
  heading?: number | null;
  speed?: number | null;
  timestamp: number;
}

export interface DeviceRegistration {
  token: string;
  platform: Exclude<MobilePlatform, 'web'>;
  appVersion: string;
  deviceId?: string;
}

export interface NetworkState {
  connected: boolean;
  connectionType: 'wifi' | 'cellular' | 'none' | 'unknown';
}
