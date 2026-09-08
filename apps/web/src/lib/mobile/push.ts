import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

export async function registerMobilePush(
  accessToken: string,
  appVersion: string = '1.0.0',
) {
  if (typeof window === 'undefined' || !Capacitor.isNativePlatform()) {
    return null;
  }

  const permission = await PushNotifications.checkPermissions();
  const finalPermission =
    permission.receive === 'granted'
      ? permission
      : await PushNotifications.requestPermissions();

  if (finalPermission.receive !== 'granted') {
    throw new Error('Push notification permission denied.');
  }

  const tokenPromise = new Promise<string>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Push registration timed out.'));
    }, 20_000);

    void PushNotifications.addListener('registration', (token) => {
      clearTimeout(timeout);
      resolve(token.value);
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
  const token = await tokenPromise;

  const platform = Capacitor.getPlatform() === 'ios' ? 'ios' : 'android';

  const response = await fetch(`${API_URL}/mobile/devices/register`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-CG-Client': 'mobile',
      'X-CG-Platform': platform,
      'X-CG-App-Version': appVersion,
    },
    body: JSON.stringify({
      deviceToken: token,
      platform,
      appVersion,
    }),
  });

  if (!response.ok) {
    throw new Error(`Device registration failed: ${response.status}`);
  }

  return response.json();
}
