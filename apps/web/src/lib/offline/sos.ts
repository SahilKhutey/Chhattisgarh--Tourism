import { isOnline } from "./network";
import { queueAction } from "./sync";

function getApiBase(): string {
  const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export interface SOSPayload {
  touristName?: string;
  touristPhone?: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: string;
  deviceId?: string;
}

export interface SOSResult {
  status: "sent" | "queued";
  message?: string;
  referenceId?: string;
  etaMinutes?: number;
  data?: unknown;
}

export async function triggerSOS(payload: SOSPayload): Promise<SOSResult> {
  // If explicitly offline, queue immediately without attempting remote dispatch
  if (!isOnline()) {
    await queueAction("SOS_CREATE", payload as unknown as Record<string, unknown>);
    return {
      status: "queued",
      message: "SOS request stored locally — waiting for connection",
    };
  }

  try {
    const response = await fetch(`${getApiBase()}/api/v1/emergency/sos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`SOS request failed with HTTP ${response.status}`);
    }

    const data = await response.json();
    return {
      status: "sent",
      referenceId: data.referenceId,
      etaMinutes: data.etaMinutes,
      message: data.message || "Emergency responders dispatched",
      data,
    };
  } catch {
    // Invariant: On network failure, persist emergency event locally and return "queued"
    await queueAction("SOS_CREATE", payload as unknown as Record<string, unknown>);
    return {
      status: "queued",
      message: "SOS request stored locally — waiting for connection",
    };
  }
}
