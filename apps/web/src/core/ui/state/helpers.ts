import type { UIState } from "./types";

export function isLoadingState(
  state: UIState,
): boolean {
  return state === "loading";
}

export function isTerminalState(
  state: UIState,
): boolean {
  return (
    state === "success" ||
    state === "empty" ||
    state === "error" ||
    state === "offline" ||
    state === "unauthorized" ||
    state === "forbidden" ||
    state === "not-found"
  );
}

export function isErrorState(
  state: UIState,
): boolean {
  return (
    state === "error" ||
    state === "offline" ||
    state === "unauthorized" ||
    state === "forbidden" ||
    state === "not-found"
  );
}
