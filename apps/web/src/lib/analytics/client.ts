import { AnalyticsEventType } from './events';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export interface AnalyticsPayload {
  type: AnalyticsEventType | string;
  userId?: string;
  placeId?: string;
  districtId?: string;
  sessionId?: string;
  latitude?: number;
  longitude?: number;
  language?: string;
  platform?: string;
  metadata?: Record<string, unknown>;
}

export async function trackEvent(
  payload: AnalyticsPayload,
): Promise<void> {
  try {
    await fetch(`${API_URL}/api/v1/analytics/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch {
    // Analytics must never break the consumer experience.
  }
}
