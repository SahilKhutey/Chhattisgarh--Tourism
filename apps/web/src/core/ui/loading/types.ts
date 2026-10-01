/**
 * Loading State Contracts for CG Tourism UI/UX
 * Establishes a canonical state model for route, component, data, and template rendering.
 */

export type LoadingState =
  | "idle"
  | "loading"
  | "refreshing"
  | "success"
  | "error"
  | "empty"
  | "offline";

export type LoadingPriority =
  | "blocking"
  | "important"
  | "background";

export interface LoadingContext {
  state: LoadingState;
  priority?: LoadingPriority;
  message?: string;
  retry?: () => void;
}

export type ContentLoadingShape =
  | "hero"
  | "article"
  | "card-grid"
  | "list"
  | "detail"
  | "map"
  | "mixed";

export interface ContentRenderState {
  state: LoadingState;
  loadingShape?: ContentLoadingShape;
}

export type LoadingEvent =
  | "START"
  | "REFRESH"
  | "SUCCESS"
  | "FAIL"
  | "OFFLINE"
  | "RESET";
