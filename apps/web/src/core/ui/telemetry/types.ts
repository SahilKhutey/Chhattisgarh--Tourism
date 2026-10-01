export type UIEventName =
  | "page_view"
  | "search_started"
  | "search_completed"
  | "filter_used"
  | "place_opened"
  | "map_interaction"
  | "content_saved"
  | "itinerary_started"
  | "itinerary_updated"
  | "booking_started"
  | "booking_completed"
  | "review_started"
  | "review_submitted"
  | "sos_opened";

export type UIEvent = {
  name: UIEventName;
  timestamp: string;
  sessionId?: string;
  route?: string;
  entityId?: string;
  metadata?: Record<string, string | number | boolean>;
};
