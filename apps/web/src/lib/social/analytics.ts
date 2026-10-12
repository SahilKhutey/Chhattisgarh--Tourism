/**
 * Social Engine Phase 8 Telemetry & Discovery Analytics
 * Tracks visitor engagement across the regional tourism discovery journey:
 * Content -> Creator -> Place -> Region -> Experience -> Original Source
 */

export type SocialEventName =
  | 'social_page_view'
  | 'social_feed_filter'
  | 'social_content_open'
  | 'social_creator_open'
  | 'social_place_open'
  | 'social_source_click'
  | 'social_destination_click'
  | 'social_load_more'
  | 'social_share';

export interface SocialEventPayloads {
  social_page_view: {
    page: string;
    path: string;
    district?: string;
  };
  social_feed_filter: {
    platform?: string;
    contentType?: string;
    district?: string;
    tab?: string;
  };
  social_content_open: {
    contentId: string;
    platform: string;
    contentType: string;
    creatorHandle: string;
    districtId?: string;
    placeSlug?: string;
  };
  social_creator_open: {
    creatorHandle: string;
    source: 'card' | 'strip' | 'lightbox' | 'detail';
  };
  social_place_open: {
    placeSlug: string;
    districtId?: string;
  };
  social_source_click: {
    contentId: string;
    platform: string;
    sourceUrl: string;
  };
  social_destination_click: {
    contentId?: string;
    placeSlug: string;
    action: 'view_details' | 'plan_itinerary';
  };
  social_load_more: {
    tab: string;
    currentCount: number;
    cursor?: string | null;
  };
  social_share: {
    contentId?: string;
    creatorHandle?: string;
    targetUrl: string;
    method: 'native' | 'clipboard' | 'whatsapp' | 'twitter';
  };
}

/**
 * Dispatches a typed social event to the analytics pipeline and window custom events.
 */
export function trackSocialEvent<E extends SocialEventName>(
  eventName: E,
  payload: SocialEventPayloads[E]
): void {
  try {
    if (typeof window === 'undefined') {
      return;
    }

    // 1. Dispatch custom DOM event for decoupled integrations
    const customEvent = new CustomEvent('cg_social_analytics', {
      detail: {
        event: eventName,
        payload,
        timestamp: Date.now(),
      },
    });
    window.dispatchEvent(customEvent);

    // 2. Check if a global analytics provider exists (e.g., window.gtag, dataLayer)
    const win = window as any;
    if (typeof win.gtag === 'function') {
      win.gtag('event', eventName, payload);
    } else if (Array.isArray(win.dataLayer)) {
      win.dataLayer.push({
        event: eventName,
        ...payload,
      });
    }

    // 3. Optional debug logger in dev mode
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.debug(`[SocialAnalytics] ${eventName}`, payload);
    }
  } catch {
    // Fail silently in telemetry
  }
}
