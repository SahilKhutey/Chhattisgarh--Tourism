import { trackEvent } from './client';
import { AnalyticsEventType } from './events';

describe('Frontend Analytics Client', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('dispatches non-blocking telemetry event with keepalive', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 'evt-1' }),
    });

    await trackEvent({
      type: AnalyticsEventType.PLACE_VIEW,
      placeId: 'place-bastar-1',
      latitude: 19.2,
      longitude: 81.7,
      platform: 'web',
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/analytics/events'),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
        body: expect.stringContaining('"type":"PLACE_VIEW"'),
      }),
    );
  });

  it('never throws even when network fails (resilience rule)', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network dropped'));

    // Must not throw or reject
    await expect(
      trackEvent({
        type: AnalyticsEventType.SOS_TRIGGERED,
        metadata: { emergency: true },
      }),
    ).resolves.not.toThrow();
  });
});
