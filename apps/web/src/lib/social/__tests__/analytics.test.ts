import { trackSocialEvent } from '../analytics';

describe('Social Engine Phase 8 Telemetry Analytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('dispatches custom DOM event for social events', () => {
    const dispatchSpy = jest.spyOn(window, 'dispatchEvent');

    trackSocialEvent('social_page_view', {
      page: 'social_home',
      path: '/social',
      district: 'bastar',
    });

    expect(dispatchSpy).toHaveBeenCalled();
    const eventArg = dispatchSpy.mock.calls[0][0] as CustomEvent;
    expect(eventArg.type).toBe('cg_social_analytics');
    expect(eventArg.detail.event).toBe('social_page_view');
    expect(eventArg.detail.payload.district).toBe('bastar');
  });

  it('forwards to window.gtag if present', () => {
    const mockGtag = jest.fn();
    (window as any).gtag = mockGtag;

    trackSocialEvent('social_source_click', {
      contentId: 'sc-123',
      platform: 'YOUTUBE',
      sourceUrl: 'https://youtube.com/watch?v=123',
    });

    expect(mockGtag).toHaveBeenCalledWith('event', 'social_source_click', {
      contentId: 'sc-123',
      platform: 'YOUTUBE',
      sourceUrl: 'https://youtube.com/watch?v=123',
    });

    delete (window as any).gtag;
  });

  it('pushes to window.dataLayer if present', () => {
    (window as any).dataLayer = [];

    trackSocialEvent('social_destination_click', {
      placeSlug: 'chitrakote-falls',
      action: 'plan_itinerary',
    });

    expect((window as any).dataLayer.length).toBe(1);
    expect((window as any).dataLayer[0].event).toBe('social_destination_click');
    expect((window as any).dataLayer[0].placeSlug).toBe('chitrakote-falls');

    delete (window as any).dataLayer;
  });
});
