/**
 * CG Tourism OS — UX State Model
 * Centralized deterministic state machine preventing pages from inventing custom loading/error behavior.
 */

export type UIState =
  | "idle"
  | "loading"
  | "success"
  | "empty"
  | "error"
  | "offline"
  | "unauthorized"
  | "forbidden"
  | "not-found";

export const isBlockingUIState = (
  state: UIState,
): boolean =>
  state === "loading" ||
  state === "error" ||
  state === "offline" ||
  state === "unauthorized" ||
  state === "forbidden" ||
  state === "not-found";
