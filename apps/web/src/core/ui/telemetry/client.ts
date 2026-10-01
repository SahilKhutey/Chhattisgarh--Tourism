import type { UIEvent } from "./types";

export type UIEventSink = (
  event: UIEvent,
) => void | Promise<void>;

let sink: UIEventSink | undefined;

export function configureUIEventSink(
  nextSink: UIEventSink | undefined,
): void {
  sink = nextSink;
}

export async function trackUIEvent(
  event: Omit<UIEvent, "timestamp">,
): Promise<void> {
  const completeEvent: UIEvent = {
    ...event,
    timestamp: new Date().toISOString(),
  };

  if (!sink) {
    return;
  }

  await sink(completeEvent);
}
