import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { Network } from '@capacitor/network';
import { Preferences } from '@capacitor/preferences';
import { Share } from '@capacitor/share';
import {
  PushNotifications,
  type Token,
} from '@capacitor/push-notifications';
import type {
  DeviceRegistration,
  MobilePlatform,
  MobilePosition,
  NetworkState,
} from './types';

export function getMobilePlatform(): MobilePlatform {
  const platform = Capacitor.getPlatform();
  if (platform === 'android') {
    return 'android';
  }
  if (platform === 'ios') {
    return 'ios';
  }
  return 'web';
}

export function isNativeMobile(): boolean {
  return Capacitor.isNativePlatform();
}

export async function getCurrentLocation(): Promise<MobilePosition> {
  const permission = await Geolocation.checkPermissions();
  if (permission.location !== 'granted') {
    const requested = await Geolocation.requestPermissions();
    if (requested.location !== 'granted') {
      throw new Error('Location permission was not granted.');
    }
  }
  const position = await Geolocation.getCurrentPosition({
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 30000,
  });
  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    accuracy: position.coords.accuracy,
    altitude: position.coords.altitude,
    heading: position.coords.heading,
    speed: position.coords.speed,
    timestamp: position.timestamp,
  };
}

export async function getNetworkState(): Promise<NetworkState> {
  const status = await Network.getStatus();
  return {
    connected: status.connected,
    connectionType: status.connectionType as NetworkState['connectionType'],
  };
}

export async function shareContent(
  title: string,
  text: string,
  url?: string,
): Promise<void> {
  if (!isNativeMobile()) {
    if (typeof navigator !== 'undefined' && navigator.share) {
      await navigator.share({
        title,
        text,
        url,
      });
      return;
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(
        `${title}\n${text}${url ? `\n${url}` : ''}`,
      );
    }
    return;
  }
  await Share.share({
    title,
    text,
    url,
    dialogTitle: 'Share CG Tourism',
  });
}

export async function saveLocalValue(
  key: string,
  value: string,
): Promise<void> {
  await Preferences.set({
    key,
    value,
  });
}

export async function readLocalValue(
  key: string,
): Promise<string | null> {
  const result = await Preferences.get({
    key,
  });
  return result.value;
}

export async function registerPushNotifications(
  appVersion: string,
): Promise<DeviceRegistration | null> {
  if (!isNativeMobile()) {
    return null;
  }
  const permission = await PushNotifications.checkPermissions();
  if (permission.receive !== 'granted') {
    const requested = await PushNotifications.requestPermissions();
    if (requested.receive !== 'granted') {
      throw new Error('Push notification permission was not granted.');
    }
  }
  await PushNotifications.createChannel({
    id: 'cg-tourism-general',
    name: 'CG Tourism',
    description: 'CG Tourism notifications',
    importance: 4,
    visibility: 1,
    sound: 'default',
  });

  const registrationPromise = new Promise<Token>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Push registration timed out after 20 seconds.'));
    }, 20_000);

    void PushNotifications.addListener('registration', (token) => {
      clearTimeout(timeout);
      resolve(token);
    });

    void PushNotifications.addListener('registrationError', (error) => {
      clearTimeout(timeout);
      reject(
        new Error(
          typeof error === 'string'
            ? error
            : ((error as any)?.error ?? 'Native push registration failed.'),
        ),
      );
    });
  });

  await PushNotifications.register();
  const token = await registrationPromise;

  return {
    token: token.value,
    platform: getMobilePlatform() as 'android' | 'ios',
    appVersion,
  };
}
